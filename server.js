import express from "express";
import  redis  from "./redis.js";
import helmet from "helmet";
import "dotenv/config";
import router from "./router.js"
import { pasteKey,now } from "./utils.js";
const app = express();
app.use(express.json());
app.use(helmet());
app.get("/", (req, res) => {
  res.send(`
    <html>
      <body>
        <h2>Create Paste</h2>
        <form method="POST" action="/ui/create">
          <textarea name="content" required></textarea><br/>
          TTL (seconds): <input name="ttl_seconds" type="number"/><br/>
          Max views: <input name="max_views" type="number"/><br/>
          <button>Create</button>
        </form>
      </body>
    </html>
  `);
});

app.post("/ui/create", express.urlencoded({ extended: false }), async (req, res) => {
  try {
    const host = req.get("host");
    const url = `${req.protocol}://${host}/api/pastes`;

    const body = {
      content: req.body.content,
      ttl_seconds: req.body.ttl_seconds ? Number(req.body.ttl_seconds) : undefined,
      max_views: req.body.max_views ? Number(req.body.max_views) : undefined
    };

    console.log(body);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).send("Error creating paste: " + text);
    }

    const data = await response.json();
    console.log(data,"here is the data")

    if (!data.url) {
      return res.status(500).send("Paste creation failed: URL missing");
    }

    res.redirect(String(data.url));
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error creating paste");
  }
});


app.use("/api",router);
app.get("/p/:id", async (req, res) => {
  const key = pasteKey(req.params.id);
  const data = await redis.hgetall(key);

  if (!data.content) {
    return res.sendStatus(404);
  }

  const currentTime = now(req);
  const expiresAt = data.expires_at ? Number(data.expires_at) : null;
  const maxViews = data.max_views ? Number(data.max_views) : null;
  const views = Number(data.views);

  if (
    (expiresAt && currentTime >= expiresAt) ||
    (maxViews && views >= maxViews)
  ) {
    return res.sendStatus(404);
  }

  await redis.hincrby(key, "views", 1);

  res.set("Content-Type", "text/html");
  res.send(`
    <!doctype html>
    <html>
      <head><title>Paste</title></head>
      <body>
        <pre>${escapeHtml(data.content)}</pre>
      </body>
    </html>
  `);
});




function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on ${port}`));
