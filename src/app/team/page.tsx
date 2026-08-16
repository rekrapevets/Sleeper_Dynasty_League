import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RosterTable } from "@/components/roster-table";
import { StartSitCard } from "@/components/start-sit-card";
import { getMyTeam } from "@/lib/analysis/team";
import { getStartSitSuggestions } from "@/lib/analysis/start-sit";
import { SLEEPER_LEAGUE_ID, SLEEPER_USER_ID } from "@/lib/sleeper/config";

export default async function TeamPage() {
  if (!SLEEPER_LEAGUE_ID || !SLEEPER_USER_ID) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Team</h1>
          <p className="text-muted-foreground">Not connected to Sleeper yet.</p>
        </div>
      </div>
    );
  }

  const [team, startSit] = await Promise.all([
    getMyTeam(SLEEPER_LEAGUE_ID, SLEEPER_USER_ID),
    getStartSitSuggestions(SLEEPER_LEAGUE_ID, SLEEPER_USER_ID),
  ]);

  if (!team) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Team</h1>
          <p className="text-muted-foreground">
            Couldn&apos;t find a roster for this user in the league.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{team.teamName}</h1>
        <p className="text-muted-foreground">
          {team.record.wins}-{team.record.losses}
          {team.record.ties ? `-${team.record.ties}` : ""} &middot; {team.points}{" "}
          pts &middot; Week {team.week}
        </p>
      </div>

      <StartSitCard result={startSit} />

      <Card>
        <CardHeader>
          <CardTitle>Starters</CardTitle>
        </CardHeader>
        <CardContent>
          <RosterTable slots={team.starters} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bench</CardTitle>
        </CardHeader>
        <CardContent>
          <RosterTable slots={team.bench} showSlot={false} />
        </CardContent>
      </Card>

      {team.ir.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Injured Reserve</CardTitle>
          </CardHeader>
          <CardContent>
            <RosterTable slots={team.ir} showSlot={false} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
