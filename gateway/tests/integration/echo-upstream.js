// TEST-ONLY stand-in for every gateway upstream (user-service, portal-service, ... n8n, rabbitmq).
// Listens on each upstream port and answers with what it received; the test reads (and clears)
// the recorded requests on the control port. /api/internal/verify-ms-token deliberately answers
// as a WORST-CASE "verified" Microsoft identity (tid + Entra role SU) so a test would notice if the
// gateway ever called it or trusted it again.
const http = require("http");

const UPSTREAM_PORTS = [5001, 4001, 4003, 4002, 4000, 4004, 4010, 5678, 15672, 4005, 4006, 4011, 4012];
const CONTROL_PORT = 9999;
let seen = [];

function upstream(port) {
  return http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      seen.push({ port, method: req.method, url: req.url, headers: req.headers });
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Content-Type", "application/json");
      if (req.url.startsWith("/api/internal/verify-ms-token")) {
        return res.end(JSON.stringify({ verified: true, tid: "00000000-0000-0000-0000-0000000000aa", oid: "11111111-1111-1111-1111-111111111111", scp: "access_as_user", roles: ["SU"], clientAppId: "x", exp: Math.floor(Date.now() / 1000) + 600 }));
      }
      res.end(JSON.stringify({ echo: true, port }));
    });
  }).listen(port, "0.0.0.0");
}

UPSTREAM_PORTS.forEach(upstream);

http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (req.url === "/__requests") {
    const out = seen;
    seen = [];
    return res.end(JSON.stringify(out));
  }
  res.end("{}");
}).listen(CONTROL_PORT, "0.0.0.0", () => console.log("echo-upstream ready"));
