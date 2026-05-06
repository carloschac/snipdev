export function generateSlug(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const base = (hostname + pathname)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
    const suffix = Math.random().toString(36).slice(2, 6);
    return `${base}-${suffix}`;
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
}
