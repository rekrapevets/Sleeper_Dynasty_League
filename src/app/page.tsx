import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLeague, getRosters, getUsers } from "@/lib/sleeper/api";
import { SLEEPER_LEAGUE_ID, SLEEPER_USER_ID } from "@/lib/sleeper/config";
import { formatPoints, teamName } from "@/lib/format";

export default async function DashboardPage() {
  if (!SLEEPER_LEAGUE_ID) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            League overview will appear here once connected to Sleeper.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Not connected yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Set <code className="rounded bg-muted px-1 py-0.5">SLEEPER_LEAGUE_ID</code>{" "}
            in your environment to connect your league.
          </CardContent>
        </Card>
      </div>
    );
  }

  const [league, users, rosters] = await Promise.all([
    getLeague(SLEEPER_LEAGUE_ID),
    getUsers(SLEEPER_LEAGUE_ID),
    getRosters(SLEEPER_LEAGUE_ID),
  ]);

  const usersById = new Map(users.map((u) => [u.user_id, u]));
  const myRoster = rosters.find((r) => r.owner_id === SLEEPER_USER_ID);

  const standings = [...rosters].sort((a, b) => {
    if (b.settings.wins !== a.settings.wins) return b.settings.wins - a.settings.wins;
    return b.settings.fpts - a.settings.fpts;
  });

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {league.name} &middot; {league.season} season &middot; {league.total_rosters}{" "}
          teams
        </p>
      </div>

      {myRoster && (
        <Card>
          <CardHeader>
            <CardTitle>{teamName(usersById.get(myRoster.owner_id ?? ""))}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>
              {myRoster.settings.wins}-{myRoster.settings.losses}
              {myRoster.settings.ties ? `-${myRoster.settings.ties}` : ""}
            </span>
            <span>
              {formatPoints(myRoster.settings.fpts, myRoster.settings.fpts_decimal)}{" "}
              pts for
            </span>
            <span>{myRoster.players?.length ?? 0} players rostered</span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {standings.map((r, i) => {
              const owner = r.owner_id ? usersById.get(r.owner_id) : undefined;
              const isMe = r.owner_id === SLEEPER_USER_ID;
              return (
                <li
                  key={r.roster_id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 text-muted-foreground">{i + 1}</span>
                    <span className={isMe ? "font-semibold" : undefined}>
                      {teamName(owner)}
                    </span>
                    {isMe && <Badge variant="secondary">You</Badge>}
                  </span>
                  <span className="text-muted-foreground">
                    {r.settings.wins}-{r.settings.losses}
                    {r.settings.ties ? `-${r.settings.ties}` : ""} &middot;{" "}
                    {formatPoints(r.settings.fpts, r.settings.fpts_decimal)}
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
