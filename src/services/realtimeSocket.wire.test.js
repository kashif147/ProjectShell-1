/**
 * @jest-environment node
 */
// The REAL socket.io-client (installed version) against a local HTTP server that records the raw
// WebSocket upgrade request: the ProjectShell token must travel in the Socket.IO CONNECT packet
// only, never in the request URL. Synthetic token only; no network beyond 127.0.0.1.
import http from "http";
import crypto from "crypto";
import { io } from "socket.io-client";
import { notificationSocketAuth } from "./realtimeSocket";

const TOKEN = "synthetic.wire-token.marker";

function decodeFrames(buf) {
  const out = [];
  let i = 0;
  while (i + 2 <= buf.length) {
    const len0 = buf[i + 1] & 0x7f;
    const masked = (buf[i + 1] & 0x80) !== 0;
    let len = len0;
    let off = i + 2;
    if (len0 === 126) { len = buf.readUInt16BE(off); off += 2; }
    const mask = masked ? buf.slice(off, off + 4) : null;
    if (masked) off += 4;
    const payload = Buffer.from(buf.slice(off, off + len));
    if (mask) for (let j = 0; j < payload.length; j++) payload[j] ^= mask[j % 4];
    out.push(payload.toString("utf8"));
    i = off + len;
  }
  return out;
}

function fakeEngineServer() {
  const seen = { urls: [], frames: [], sockets: [] };
  const server = http.createServer((req, res) => {
    seen.urls.push(req.url);
    res.end();
  });
  server.on("upgrade", (req, sock) => {
    seen.sockets.push(sock);
    seen.urls.push(req.url);
    const accept = crypto.createHash("sha1").update(req.headers["sec-websocket-key"] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
    sock.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
    // Engine.IO OPEN packet, so the Socket.IO client sends its CONNECT packet (with auth)
    const open = Buffer.from('0{"sid":"s1","upgrades":[],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}');
    sock.write(Buffer.concat([Buffer.from([0x81, open.length]), open]));
    sock.on("data", (d) => seen.frames.push(...decodeFrames(d)));
  });
  return { server, seen };
}

test("real client: the token is in the CONNECT packet only, never in the upgrade URL", async () => {
  global.localStorage = { getItem: (k) => (k === "token" ? TOKEN : null) };
  const { server, seen } = fakeEngineServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const { port } = server.address();
  const socket = io(`http://127.0.0.1:${port}`, {
    path: "/notification-service/api/socket.io",
    auth: notificationSocketAuth,
    transports: ["websocket"],
    reconnection: false,
  });
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("no CONNECT packet: " + JSON.stringify({ urls: seen.urls.length, frames: seen.frames.map((f) => f.slice(0, 2)) }))), 4000);
    const poll = setInterval(() => {
      if (seen.frames.some((f) => f.startsWith("40"))) {
        clearInterval(poll);
        clearTimeout(t);
        resolve();
      }
    }, 20);
  });
  socket.disconnect();
  seen.sockets.forEach((s) => s.destroy()); // upgraded sockets would otherwise keep close() waiting
  await new Promise((r) => server.close(r));

  expect(seen.urls).toHaveLength(1);
  const url = seen.urls[0];
  expect(url).not.toContain(TOKEN);
  expect(url).not.toMatch(/[?&](token|access_token|jwt)=/);
  const params = new URL(url, "http://x").searchParams;
  expect([...params.keys()].sort()).toEqual(["EIO", "transport"]); // only Engine.IO fields
  expect(params.get("transport")).toBe("websocket");
  const connect = seen.frames.find((f) => f.startsWith("40"));
  expect(JSON.parse(connect.slice(2))).toEqual({ token: TOKEN }); // auth travels here
});
