import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface DeezerTrack {
  id: number;
  title: string;
  title_short?: string;
  preview: string;
  artist: { name: string };
  album: {
    title: string;
    cover?: string;
    cover_medium?: string;
    cover_big?: string;
    md5_image?: string;
  };
}

interface RadioTrack {
  slug: string;
  title: string;
  artist: string;
  album: string;
  preview: string;
  cover: string;
}

const TRACK_IDS: { slug: string; id: number; fallbackQuery: string }[] = [
  { slug: "join-me-in-death", id: 3785295542, fallbackQuery: 'track:"Join Me In Death" artist:"HIM"' },
  { slug: "potranca", id: 3540228131, fallbackQuery: 'track:"Potranca" artist:"slipmami"' },
  { slug: "ultraviolence", id: 79363287, fallbackQuery: 'track:"Ultraviolence" artist:"Lana Del Rey"' },
  { slug: "ride", id: 930264002, fallbackQuery: 'track:"Ride" artist:"Lana Del Rey"' },
  { slug: "let-down", id: 138539979, fallbackQuery: 'track:"Let Down" artist:"Radiohead"' },
  { slug: "fireworks", id: 124889270, fallbackQuery: 'track:"Fireworks" artist:"Mitski"' },
  { slug: "pisca-duas-vezes", id: 3413957001, fallbackQuery: 'track:"Pisca Duas Vezes"' },
  { slug: "i-love-you", id: 3785295522, fallbackQuery: 'track:"I Love You" artist:"HIM"' },
  { slug: "ma-cherie", id: 4010094321, fallbackQuery: "Ma Chérie 愛しい君へ" },
  { slug: "tudo-vai-dar-certo", id: 930232112, fallbackQuery: 'track:"Tudo Vai Dar Certo" artist:"Natiruts"' },
];

function coverUrl(t: DeezerTrack): string {
  if (t.album.cover_medium) return t.album.cover_medium;
  if (t.album.cover_big) return t.album.cover_big;
  if (t.album.cover) return t.album.cover;
  if (t.album.md5_image) {
    return `https://cdn-images.dzcdn.net/images/cover/${t.album.md5_image}/250x250-000000-80-0-0.jpg`;
  }
  return "";
}

async function fetchTrackById(id: number): Promise<DeezerTrack | null> {
  const resp = await fetch(`https://api.deezer.com/track/${id}`);
  if (!resp.ok) return null;
  const t = (await resp.json()) as DeezerTrack;
  if (!t || !t.preview || t.preview.length === 0) return null;
  return t;
}

async function searchDeezer(q: string): Promise<DeezerTrack | null> {
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=5`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  const data = await resp.json();
  const tracks: DeezerTrack[] = data.data || [];
  return tracks.find((t) => t.preview && t.preview.length > 0) || null;
}

async function fetchFreshFromDeezer(slug: string, id: number, fallbackQuery: string): Promise<RadioTrack | null> {
  let t = await fetchTrackById(id);
  if (!t) t = await searchDeezer(fallbackQuery);
  if (!t) return null;

  const track: RadioTrack = {
    slug,
    title: t.title_short || t.title,
    artist: t.artist.name,
    album: t.album.title,
    preview: t.preview,
    cover: coverUrl(t),
  };

  // Persist to cache so future requests don't need Deezer
  await supabase
    .from("radio_tracks")
    .upsert(
      { ...track, deezer_id: t.id, updated_at: new Date().toISOString() },
      { onConflict: "slug" }
    );

  return track;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // 1. Load everything we have cached
    const { data: cached } = await supabase
      .from("radio_tracks")
      .select("slug, title, artist, album, preview, cover");

    const cacheMap = new Map<string, RadioTrack>();
    if (cached) {
      for (const c of cached) {
        cacheMap.set(c.slug, c as RadioTrack);
      }
    }

    // 2. Build result — use cache when available, fetch fresh when missing
    const results = await Promise.all(
      TRACK_IDS.map(async ({ slug, id, fallbackQuery }) => {
        const cachedTrack = cacheMap.get(slug);
        if (cachedTrack && cachedTrack.preview) {
          return cachedTrack;
        }
        // Not cached yet — fetch from Deezer and persist
        return fetchFreshFromDeezer(slug, id, fallbackQuery);
      })
    );

    const tracks: Record<string, RadioTrack> = {};
    for (const r of results) {
      if (r && r.preview) tracks[r.slug] = r;
    }

    return new Response(JSON.stringify({ tracks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
