import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradeBuilder } from "@/components/trade-builder";
import { getTradeTeams, getTradeWindow } from "@/lib/analysis/trade";
import { SLEEPER_LEAGUE_ID, SLEEPER_USER_ID } from "@/lib/sleeper/config";

export default async function TradePage() {
  if (!SLEEPER_LEAGUE_ID) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trade Center</h1>
          <p className="text-muted-foreground">Not connected to Sleeper yet.</p>
        </div>
      </div>
    );
  }

  const [teams, tradeWindow] = await Promise.all([
    getTradeTeams(SLEEPER_LEAGUE_ID),
    getTradeWindow(SLEEPER_LEAGUE_ID),
  ]);
  const myTeam = teams.find((t) => t.ownerId === SLEEPER_USER_ID);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trade Center</h1>
        <p className="text-muted-foreground">
          Evaluate trade offers with other teams in the league.
        </p>
      </div>

      {!tradeWindow.isOpen && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Trading is closed</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Per the league by-laws, trading closes from the Monday of week{" "}
            {tradeWindow.playoffWeekStart} through the end of the championship
            game. It&apos;s currently week {tradeWindow.week}. You can still
            build and evaluate hypothetical trades below, but nothing can
            actually go through in Sleeper until the offseason.
          </CardContent>
        </Card>
      )}

      <TradeBuilder teams={teams} myRosterId={myTeam?.rosterId ?? null} />

      <p className="text-xs text-muted-foreground">
        Per the league by-laws: trading away a future 1st-round pick requires
        paying for those years in advance, and all trades go through a quick
        collusion review by the commissioner committee before being approved.
      </p>
    </div>
  );
}
