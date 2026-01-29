import crypto from "crypto";


export function now(req) {
  if (process.env.TEST_MODE === "1") {
    const t = req.headers["x-test-now-ms"];
    if (t) return Number(t);
  }
  return Date.now();
}

export function pasteKey (id) { return `paste:${id}`; }
export function generateId() { return crypto.randomBytes(6).toString("hex"); }
