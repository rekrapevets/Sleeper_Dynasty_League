export function formatPoints(fpts: number, fptsDecimal?: number): string {
  return (fpts + (fptsDecimal ?? 0) / 100).toFixed(1);
}

export function teamName(user: { display_name: string; metadata?: { team_name?: string | null } | null } | undefined): string {
  return user?.metadata?.team_name || user?.display_name || "Unknown Team";
}
