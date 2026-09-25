/**
 * Parse the connection-string shapes used by this project into explicit
 * pg_dump / pg_restore flags. Handles the empty-host "socket dir" form
 * (postgresql://user@/db?host=/path&port=5432) and the TCP form
 * (postgresql://user:pass@host:port/db?ssl=true) without WHATWG URL strictness.
 */
function parseDbUrl(url) {
  const match = /^postgres(?:ql)?:\/\/(.*)$/.exec(url);
  if (!match) throw new Error(`Could not parse connection string: ${url}`);
  const rest = match[1];

  const at = rest.lastIndexOf("@");
  const creds = at >= 0 ? rest.slice(0, at) : "";
  const pathWithQuery = at >= 0 ? rest.slice(at + 1) : rest;

  const user = creds.split(":")[0] || null;

  const qIdx = pathWithQuery.indexOf("?");
  const query = qIdx >= 0 ? pathWithQuery.slice(qIdx + 1) : "";
  const pathPart = qIdx >= 0 ? pathWithQuery.slice(0, qIdx) : pathWithQuery;

  const slash = pathPart.indexOf("/");
  const authority = slash >= 0 ? pathPart.slice(0, slash) : pathPart;
  const db = slash >= 0 ? pathPart.slice(slash + 1) : "";

  if (!db) throw new Error("Connection string is missing a database name");
  if (!user) throw new Error("Connection string is missing a user");

  const params = new URLSearchParams(query);
  let host = params.get("host");
  let port = params.get("port");
  if (authority) {
    const am = /^([^:]*)(?::(\d+))?$/.exec(authority);
    if (am && am[1]) host = am[1];
    if (am && am[2]) port = am[2];
  }

  return { db, user, host: host || null, port: port || "5432" };
}

module.exports = { parseDbUrl };
