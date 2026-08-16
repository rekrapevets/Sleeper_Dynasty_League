import type { SleeperPlayer } from "@/lib/sleeper/types";

export function playerName(player: SleeperPlayer | null): string {
  if (!player) return "Empty";
  return (
    player.full_name ||
    `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim() ||
    "Unknown Player"
  );
}

export function playerMeta(player: SleeperPlayer | null): string {
  if (!player) return "";
  return [player.position, player.team].filter(Boolean).join(" · ");
}
