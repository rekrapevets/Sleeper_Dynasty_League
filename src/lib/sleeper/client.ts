const BASE_URL = "https://api.sleeper.app/v1";

export async function sleeperFetch<T>(
  path: string,
  revalidateSeconds: number
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) {
    throw new Error(`Sleeper API error ${res.status} for ${path}`);
  }
  return res.json() as Promise<T>;
}
