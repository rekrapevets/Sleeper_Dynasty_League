import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InjuryBadge, ByeBadge } from "@/components/player-badges";
import { playerName, playerMeta } from "@/lib/player-display";
import type { RosterSlot } from "@/lib/analysis/team";

export function RosterTable({
  slots,
  showSlot = true,
}: {
  slots: RosterSlot[];
  showSlot?: boolean;
}) {
  if (slots.length === 0) {
    return <p className="text-sm text-muted-foreground">No players.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showSlot && <TableHead className="w-16">Slot</TableHead>}
          <TableHead>Player</TableHead>
          <TableHead>Pos / Team</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {slots.map((slot, i) => (
          <TableRow key={`${slot.playerId}-${i}`}>
            {showSlot && (
              <TableCell className="text-muted-foreground">
                {slot.slotLabel}
              </TableCell>
            )}
            <TableCell className="font-medium">
              {playerName(slot.player)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {playerMeta(slot.player)}
            </TableCell>
            <TableCell>
              <div className="flex gap-1.5">
                <InjuryBadge status={slot.player?.injury_status} />
                <ByeBadge isBye={slot.isBye} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
