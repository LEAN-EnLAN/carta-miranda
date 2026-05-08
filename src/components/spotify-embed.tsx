function extractSpotifyTrackId(raw: string): string | null {
  if (!raw) return null;
  const match = raw.match(/track\/([a-zA-Z0-9]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9]+$/.test(raw)) return raw;
  return null;
}

export function SpotifyEmbed({ track }: { track: string }) {
  const trackId = extractSpotifyTrackId(track);
  if (!trackId) return null;
  return (
    <iframe
      src={`https://open.spotify.com/embed/track/${trackId}`}
      width="100%"
      height="152"
      style={{ border: 0 }}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}
