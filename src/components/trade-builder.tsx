"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { TradeTeam } from "@/lib/analysis/trade";

function AssetList({
  team,
  selected,
  onToggle,
}: {
  team: TradeTeam;
  selected: Set<string>;
  onToggle: (key: string) => void;
}) {
  if (team.assets.length === 0) {
    return <p className="text-sm text-muted-foreground">No tradeable assets.</p>;
  }

  return (
    <div className="flex max-h-96 flex-col gap-1 overflow-y-auto rounded-md border p-2">
      {team.assets.map((asset) => (
        <label
          key={asset.key}
          className="flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
        >
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.has(asset.key)}
              onChange={() => onToggle(asset.key)}
              className="size-4"
            />
            <span className="font-medium">{asset.label}</span>
            <span className="text-muted-foreground">{asset.sublabel}</span>
          </span>
          <span className="text-muted-foreground">{asset.value}</span>
        </label>
      ))}
    </div>
  );
}

export function TradeBuilder({
  teams,
  myRosterId,
}: {
  teams: TradeTeam[];
  myRosterId: number | null;
}) {
  const myTeam = teams.find((t) => t.rosterId === myRosterId) ?? teams[0];
  const otherTeams = teams.filter((t) => t.rosterId !== myTeam?.rosterId);

  const [otherRosterId, setOtherRosterId] = useState<string>(
    String(otherTeams[0]?.rosterId ?? "")
  );
  const otherTeam = teams.find((t) => String(t.rosterId) === otherRosterId);

  const [mySelected, setMySelected] = useState<Set<string>>(new Set());
  const [otherSelected, setOtherSelected] = useState<Set<string>>(new Set());

  function toggle(
    set: Set<string>,
    setSet: (s: Set<string>) => void,
    key: string
  ) {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSet(next);
  }

  function handleOtherTeamChange(value: string | null) {
    if (!value) return;
    setOtherRosterId(value);
    setOtherSelected(new Set());
  }

  const myValue = useMemo(
    () =>
      myTeam?.assets
        .filter((a) => mySelected.has(a.key))
        .reduce((sum, a) => sum + a.value, 0) ?? 0,
    [myTeam, mySelected]
  );

  const otherValue = useMemo(
    () =>
      otherTeam?.assets
        .filter((a) => otherSelected.has(a.key))
        .reduce((sum, a) => sum + a.value, 0) ?? 0,
    [otherTeam, otherSelected]
  );

  if (!myTeam || !otherTeam) {
    return (
      <p className="text-sm text-muted-foreground">
        Not enough teams to build a trade.
      </p>
    );
  }

  const diff = otherValue - myValue;
  const totalValue = myValue + otherValue;
  const diffPct = totalValue > 0 ? Math.abs(diff) / totalValue : 0;
  const nothingSelected = mySelected.size === 0 && otherSelected.size === 0;

  let verdict = "Select players or picks from both sides to evaluate a trade.";
  if (!nothingSelected) {
    if (diffPct < 0.08) {
      verdict = "Roughly even value on both sides.";
    } else if (diff > 0) {
      verdict = `Favors you by about ${Math.abs(diff)} pts (${(diffPct * 100).toFixed(0)}%).`;
    } else {
      verdict = `Favors ${otherTeam.teamName} by about ${Math.abs(diff)} pts (${(diffPct * 100).toFixed(0)}%).`;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{myTeam.teamName} gives up</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <AssetList
              team={myTeam}
              selected={mySelected}
              onToggle={(key) => toggle(mySelected, setMySelected, key)}
            />
            <p className="text-sm text-muted-foreground">
              Total value: {myValue}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Receives from</CardTitle>
              <Select value={otherRosterId} onValueChange={handleOtherTeamChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {otherTeams.map((t) => (
                    <SelectItem key={t.rosterId} value={String(t.rosterId)}>
                      {t.teamName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <AssetList
              team={otherTeam}
              selected={otherSelected}
              onToggle={(key) => toggle(otherSelected, setOtherSelected, key)}
            />
            <p className="text-sm text-muted-foreground">
              Total value: {otherValue}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verdict</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Badge variant={nothingSelected || diffPct < 0.08 ? "secondary" : "outline"}>
            {myValue} vs {otherValue}
          </Badge>
          <p className="text-sm">{verdict}</p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Values are a rough, directional heuristic (current relevance, position,
        experience) — Sleeper has no real dynasty market data. Use this as a
        conversation starter, not gospel.
      </p>
    </div>
  );
}
