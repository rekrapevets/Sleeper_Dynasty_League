import { Badge } from "@/components/ui/badge";

const DESTRUCTIVE_STATUSES = new Set([
  "Out",
  "Doubtful",
  "IR",
  "PUP",
  "Suspended",
  "NA",
]);

export function InjuryBadge({ status }: { status?: string | null }) {
  if (!status || status === "Active") return null;
  return (
    <Badge variant={DESTRUCTIVE_STATUSES.has(status) ? "destructive" : "outline"}>
      {status}
    </Badge>
  );
}

export function ByeBadge({ isBye }: { isBye: boolean }) {
  if (!isBye) return null;
  return <Badge variant="outline">BYE</Badge>;
}
