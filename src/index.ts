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

/**
 * Check if a file already exists in Supabase Storage.
 * If it does, return the permanent public URL.
 */
async function checkStoredFile(slug: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from("radio-audio")
    .list("", { search: `${slug}.mp3` });

  if (data && data.length > 0) {
    const { data: urlData } = supabase.storage
      .from("radio-audio")
      .getPublicUrl(`${slug}.mp3`);
    if (urlData?.publicUrl) return urlData.publicUrl;
  }
  return null;
}

/**
 * Download the MP3 from Deezer and upload it to Supabase Storage.
 * Returns the permanent public URL of the stored file.
 */
async function downloadAndStore(slug: string, deezerUrl: string): Promise<string | null> {
  try {
    const resp = await fetch(deezerUrl);
    if (!resp.ok) return null;
    const arrayBuffer = await resp.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("radio-audio")
      .upload(`${slug}.mp3`, bytes, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error(`Upload failed for ${slug}:`, uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("radio-audio")
      .getPublicUrl(`${slug}.mp3`);

    return urlData?.publicUrl || null;
  } catch (err) {
    console.error(`Download/store failed for ${slug}:`, err);
    return null;
  }
}

/**
 * Get a permanent URL for a track:
 * 1. Check if the MP3 is already stored in Supabase Storage → use that URL
 * 2. If not, fetch fresh from Deezer, download the MP3, upload to Storage
 * 3. Cache the metadata + permanent URL in the database
 */
async function resolveTrack(slug: string, id: number, fallbackQuery: string): Promise<RadioTrack | null> {
  // Step 1: Check storage first
  const storedUrl = await checkStoredFile(slug);
  if (storedUrl) {
    // Load metadata from DB (it should already be there from a previous run)
    const { data: cached } = await supabase
      .from("radio_tracks")
      .select("slug, title, artist, album, preview, cover")
      .eq("slug", slug)
      .maybeSingle();

    if (cached) {
      // Return with the permanent storage URL (not the stale Deezer URL)
      return { ...cached, preview: storedUrl } as RadioTrack;
    }
  }

  // Step 2: Fetch fresh from Deezer
  let t = await fetchTrackById(id);
  if (!t) t = await searchDeezer(fallbackQuery);
  if (!t) return null;

  // Step 3: Download the MP3 and store it permanently
  const permanentUrl = await downloadAndStore(slug, t.preview);
  const finalUrl = permanentUrl || t.preview; // fallback to Deezer URL if storage fails

  const track: RadioTrack = {
    slug,
    title: t.title_short || t.title,
    artist: t.artist.name,
    album: t.album.title,
    preview: finalUrl,
    cover: coverUrl(t),
  };

  // Cache metadata in DB
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
    const results = await Promise.all(
      TRACK_IDS.map(({ slug, id, fallbackQuery }) =>
        resolveTrack(slug, id, fallbackQuery)
      )
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
