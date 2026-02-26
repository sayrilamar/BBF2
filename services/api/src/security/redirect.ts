export const DEFAULT_ALLOWLIST = new Set([
  "www.expedia.com",
  "expedia.com",
]);

export function assertAllowlisted(url: URL, allowlist: Set<string> = DEFAULT_ALLOWLIST) {
  if (!allowlist.has(url.hostname)) {
    throw new Error(`Redirect host not allowlisted: ${url.hostname}`);
  }
}
