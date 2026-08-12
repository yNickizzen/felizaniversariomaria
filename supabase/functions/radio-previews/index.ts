import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TRACKS: { slug: string; query: string }[] = [
  { slug: "join-me-in-death", query: 'track:"Join Me in Death" artist:"HIM"' },
  { slug: "potranca", query: 'track:"Potranca" artist:"O Rappa"' },
  { slug: "ultraviolence", query: 'track:"Ultraviolence" artist:"Lana Del Rey"' },
  { slug: "ride", query: 'track:"Ride" artist:"Lana Del Rey"' },
  { slug: "let-down", query: 'track:"Let Down" artist:"Radiohead"' },
  { slug: "fireworks", query: 'track:"Fireworks" artist:"Lana Del Rey"' },
  { slug: "pisca-duas-vezes", query: 'track:"Pisca Duas Vezes" artist:"O Rappa"' },
  { slug: "i-love-you", query: 'track:"I Love You" artist:"Lana Del Rey"' },
  { slug: "ma-cherie", query: 'track:"Ma Cherie" artist:"DJ Snake"' },
  { slug: "tudo-vai-dar-certo", query: 'track:"Tudo Vai Dar Certo" artist:"O Rappa"' },
];

function createSupabaseClient() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key);
}

async function searchDeezer(query: string): Promise<{
  id: number; title: string; artist: string; album: string;
  preview: string; cover: string;
} | null> {
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  const data = await resp.json();
  const track = data?.data?.[0];
  if (!track || !track.preview) return null;
  return {
    id: track.id,
    title: track.title,
    artist: track.artist?.name ?? "",
    album: track.album?.title ?? "",
    preview: track.preview,
    cover: track.album?.cover_medium ?? "",
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient();

    const { data: existing } = await supabase
      .from("radio_tracks")
      .select("slug,title,artist,album,preview,cover");

    const tracksBySlug: Record<string, { title: string; artist: string; album: string; preview: string; cover: string }> = {};

    if (existing && existing.length > 0) {
      for (const row of existing) {
        tracksBySlug[row.slug] = {
          title: row.title,
          artist: row.artist,
          album: row.album,
          preview: row.preview,
          cover: row.cover,
        };
      }
    }

    const toFetch = TRACKS.filter((t) => !tracksBySlug[t.slug] || !tracksBySlug[t.slug].preview);

    for (const track of toFetch) {
      const found = await searchDeezer(track.query);
      if (found) {
        tracksBySlug[track.slug] = {
          title: found.title,
          artist: found.artist,
          album: found.album,
          preview: found.preview,
          cover: found.cover,
        };
        await supabase
          .from("radio_tracks")
          .upsert({
            slug: track.slug,
            title: found.title,
            artist: found.artist,
            album: found.album,
            preview: found.preview,
            cover: found.cover,
            deezer_id: found.id,
            updated_at: new Date().toISOString(),
          }, { onConflict: "slug" });
      }
    }

    return new Response(
      JSON.stringify({ tracks: tracksBySlug }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
