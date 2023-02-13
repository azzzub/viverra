export function getTeamNamePrefix(name: string | undefined) {
  return name?.replaceAll(" ", "_").toLowerCase() || "";
}
