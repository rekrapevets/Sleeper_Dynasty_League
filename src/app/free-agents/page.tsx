import { FreeAgentsTable } from "@/components/free-agents-table";
import { getFreeAgents } from "@/lib/analysis/free-agents";
import { SLEEPER_LEAGUE_ID } from "@/lib/sleeper/config";

export default async function FreeAgentsPage() {
  if (!SLEEPER_LEAGUE_ID) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Free Agents</h1>
          <p className="text-muted-foreground">Not connected to Sleeper yet.</p>
        </div>
      </div>
    );
  }

  const agents = await getFreeAgents(SLEEPER_LEAGUE_ID);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Free Agents</h1>
        <p className="text-muted-foreground">
          Search and filter unrostered players in your league.
        </p>
      </div>
      <FreeAgentsTable agents={agents} />
    </div>
  );
}
