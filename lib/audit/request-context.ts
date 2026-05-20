import "server-only";

export function getTrustedClientIp(headerStore: Pick<Headers, "get">) {
  const forwardedFor = headerStore.get("x-forwarded-for");
  const forwardedIps =
    forwardedFor
      ?.split(",")
      .map((ip) => ip.trim())
      .filter(Boolean) ?? [];

  return forwardedIps[forwardedIps.length - 1] ?? headerStore.get("x-real-ip");
}
