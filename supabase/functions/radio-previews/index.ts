import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TRACK_IDS: Record<string, { id: string; title: string; artist: string; album: string }> = {
  "join-me-in-death": { id: "3785295542", title: "Join Me In Death", artist: "HIM", album: "Razorblade Romance" },
  "potranca": { id: "3540228131", title: "Potranca", artist: "slipmami", album: "Gostosa Posturada" },
  "ultraviolence": { id: "79363287", title: "Ultraviolence", artist: "Lana Del Rey", album: "Ultraviolence" },
  "ride": { id: "930264002", title: "Ride", artist: "Lana Del Rey", album: "Born To Die" },
  "let-down": { id: "138539979", title: "Let Down", artist: "Radiohead", album: "OK Computer" },
  "fireworks": { id: "124889270", title: "Fireworks", artist: "Mitski", album: "Puberty 2" },
  "pisca-duas-vezes": { id: "3413957001", title: "Pisca Duas Vezes", artist: "NandaTsunami", album: "É Disso Que Eu Me Alimento" },
  "i-love-you": { id: "3785295522", title: "I Love You (Prelude To Tragedy)", artist: "HIM", album: "Razorblade Romance" },
  "ma-cherie": { id: "4010094321", title: "ma chérie", artist: "Malice Mizer", album: "MALICE MIZER" },
  "tudo-vai-dar-certo": { id: "930232112", title: "Tudo Vai Dar Certo", artist: "Natiruts", album: "Tudo Vai Dar Certo" },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const results: Record<string, { preview: string; cover: string; title: string; artist: string; album: string }> = {};

    const entries = Object.entries(TRACK_IDS);
    const fetches = entries.map(async ([slug, info]) => {
      try {
        const resp = await fetch(`https://api.deezer.com/track/${info.id}`);
        if (!resp.ok) return [slug, null] as const;
        const data = await resp.json();
        return [slug, {
          preview: data.preview || "",
          cover: data.album?.cover_big || data.album?.cover_medium || "",
          title: data.title || info.title,
          artist: data.artist?.name || info.artist,
          album: data.album?.title || info.album,
        }] as const;
      } catch {
        return [slug, null] as const;
      }
    });

    const settled = await Promise.all(fetches);
    for (const [slug, data] of settled) {
      if (data) results[slug] = data;
    }

    return new Response(JSON.stringify({ tracks: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
