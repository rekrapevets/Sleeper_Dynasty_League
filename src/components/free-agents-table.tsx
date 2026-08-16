"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InjuryBadge } from "@/components/player-badges";
import { playerName } from "@/lib/player-display";
import type { FreeAgent } from "@/lib/analysis/free-agents";

const POSITIONS = ["ALL", "QB", "RB", "WR", "TE", "K", "DEF"] as const;
const PAGE_SIZE = 200;

export function FreeAgentsTable({ agents }: { agents: FreeAgent[] }) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<(typeof POSITIONS)[number]>("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agents.filter(({ player }) => {
      if (position !== "ALL" && player.position !== position) return false;
      if (!q) return true;
      return playerName(player).toLowerCase().includes(q);
    });
  }, [agents, query, position]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search players..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={position}
          onValueChange={(v) => setPosition(v as (typeof POSITIONS)[number])}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POSITIONS.map((p) => (
              <SelectItem key={p} value={p}>
                {p === "ALL" ? "All positions" : p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} players</p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Pos</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.slice(0, PAGE_SIZE).map(({ playerId, player }) => (
            <TableRow key={playerId}>
              <TableCell className="font-medium">
                {playerName(player)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {player.position}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {player.team ?? "-"}
              </TableCell>
              <TableCell>
                <InjuryBadge status={player.injury_status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filtered.length > PAGE_SIZE && (
        <p className="text-sm text-muted-foreground">
          Showing top {PAGE_SIZE} of {filtered.length}. Refine your search to
          narrow further.
        </p>
      )}
    </div>
  );
}
