import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InjuryBadge } from "@/components/player-badges";
import { playerName } from "@/lib/player-display";
import type { StartSitResult } from "@/lib/analysis/start-sit";

export function StartSitCard({ result }: { result: StartSitResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Start/Sit Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        {result.weeksConsidered === 0 ? (
          <p className="text-sm text-muted-foreground">
            Not enough game data yet this season to generate suggestions.
          </p>
        ) : result.suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Your starting lineup looks good based on the last{" "}
            {result.weeksConsidered} week
            {result.weeksConsidered === 1 ? "" : "s"} of scoring.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground">{s.outSlotLabel}:</span>
                  <span className="font-medium">{playerName(s.inPlayer)}</span>
                  <span className="text-muted-foreground">over</span>
                  <span className="font-medium">{playerName(s.outPlayer)}</span>
                  <InjuryBadge status={s.outPlayer.injury_status} />
                </div>
                <p className="text-xs text-muted-foreground">{s.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
