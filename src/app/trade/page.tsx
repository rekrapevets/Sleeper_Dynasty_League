import { TradeBuilder } from "@/components/trade-builder";
import { getTradeTeams } from "@/lib/analysis/trade";
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

  const teams = await getTradeTeams(SLEEPER_LEAGUE_ID);
  const myTeam = teams.find((t) => t.ownerId === SLEEPER_USER_ID);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trade Center</h1>
        <p className="text-muted-foreground">
          Evaluate trade offers with other teams in the league.
        </p>
      </div>
      <TradeBuilder teams={teams} myRosterId={myTeam?.rosterId ?? null} />
    </div>
  );
}
