import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RosterTable } from "@/components/roster-table";
import { getLeagueTeams } from "@/lib/analysis/league";
import { SLEEPER_LEAGUE_ID } from "@/lib/sleeper/config";

export default async function LeaguePage() {
  if (!SLEEPER_LEAGUE_ID) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">League</h1>
          <p className="text-muted-foreground">Not connected to Sleeper yet.</p>
        </div>
      </div>
    );
  }

  const teams = await getLeagueTeams(SLEEPER_LEAGUE_ID);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">League</h1>
        <p className="text-muted-foreground">
          Every team&apos;s roster, bench, and future draft picks.
        </p>
      </div>

      <Tabs defaultValue={String(teams[0]?.rosterId)}>
        <div className="overflow-x-auto">
          <TabsList className="h-auto flex-wrap">
            {teams.map((team) => (
              <TabsTrigger key={team.rosterId} value={String(team.rosterId)}>
                {team.teamName}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {teams.map((team) => (
          <TabsContent
            key={team.rosterId}
            value={String(team.rosterId)}
            className="flex flex-col gap-6 pt-4"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{team.teamName}</h2>
              <span className="text-sm text-muted-foreground">
                {team.record.wins}-{team.record.losses}
                {team.record.ties ? `-${team.record.ties}` : ""} &middot;{" "}
                {team.points} pts
              </span>
            </div>

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

            <Card>
              <CardHeader>
                <CardTitle>Future Draft Picks</CardTitle>
              </CardHeader>
              <CardContent>
                {team.futurePicks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No upcoming picks on record.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {team.futurePicks.map((pick, i) => (
                      <Badge key={i} variant="outline">
                        {pick.season} Round {pick.round}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
