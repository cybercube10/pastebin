import  redis from "./redis.js";
import { pasteKey,now,generateId } from "./utils.js";

export const getHealthZ = async(req,res)=>{
    try {
        await redis.ping();
        res.json({ok:true})
    } catch (error) {
        res.status(500).json({ok:false})
    }
}

export const generatePaste = async (req, res) => {
  let { content, ttl_seconds, max_views } = req.body;
  ttl_seconds = req.body.ttl_seconds ? Number(req.body.ttl_seconds) : undefined;
  max_views = req.body.max_views ? Number(req.body.max_views) : undefined;

  console.log("is this even running ")
  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "pls enter a valid content" });
  }
   console.log(typeof ttl_seconds);
   console.log(typeof max_views);
  if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
    return res.status(400).json({ error: "ttl cannot be lesser than 1" });
  }

  if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
    return res.status(400).json({ error: "max views cannot be lesser than 1 " });
  }

  const id = generateId();
  console.log(id,"here is id ")
  const expiresAt = ttl_seconds ? now(req) + ttl_seconds * 1000 : null;

  await redis.hset(pasteKey(id), {
    content,
    expires_at: expiresAt ?? "",
    max_views: max_views ?? "",
    views: 0
  });

  res.status(201).json({
    id,
    url: `${req.protocol}://${req.get("host")}/p/${id}`
  });
};

export const fetchPaste = async(req,res)=>{
  const key = pasteKey(req.params.id);
  const data = await redis.hgetall(key);

  if (!data.content) {
    return res.status(404).json({ error: "Not found" });
  }

  const currentTime = now(req);
  const expiresAt = data.expires_at ? Number(data.expires_at) : null;
  const maxViews = data.max_views ? Number(data.max_views) : null;
  const views = Number(data.views);

  if (
    (expiresAt && currentTime >= expiresAt) ||
    (maxViews && views >= maxViews)
  ) {
    return res.status(404).json({ error: "paste not found " });
  }

  await redis.hincrby(key, "views", 1);

  res.json({
    content: data.content,
    remaining_views: maxViews ? Math.max(0, maxViews - views - 1) : null,
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
  });
}

