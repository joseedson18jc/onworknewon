/* =========================================================================
   POST /api/faceswap
   Body: { faceImage: dataURL, targetImage: dataURL }
   Uses Replicate to swap the visitor's face onto the base player photo.

   Env vars (set in Vercel project settings):
     REPLICATE_API_TOKEN   (required)  -> https://replicate.com/account/api-tokens
     REPLICATE_FACESWAP_MODEL (optional) default "cdingram/face-swap"
     REPLICATE_SWAP_FIELD     (optional) default "swap_image"  (the new face)
     REPLICATE_TARGET_FIELD   (optional) default "input_image" (the photo to edit)
   ========================================================================= */

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    res.status(500).json({ error: "REPLICATE_API_TOKEN não configurado no servidor." });
    return;
  }

  try {
    const body = await readJson(req);
    const { faceImage, targetImage } = body || {};
    if (!faceImage || !targetImage) {
      res.status(400).json({ error: "faceImage e targetImage são obrigatórios." });
      return;
    }

    const model = process.env.REPLICATE_FACESWAP_MODEL || "cdingram/face-swap";
    const swapField = process.env.REPLICATE_SWAP_FIELD || "swap_image";
    const targetField = process.env.REPLICATE_TARGET_FIELD || "input_image";

    const input = {};
    input[swapField] = faceImage;     // the NEW face (visitor)
    input[targetField] = targetImage; // the photo to edit (player base)

    // Create prediction against the model's default version
    const createResp = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait", // ask Replicate to hold the connection until done (best effort)
      },
      body: JSON.stringify({ input }),
    });

    let prediction = await createResp.json();
    if (!createResp.ok) {
      return res.status(502).json({ error: prediction?.detail || "Erro ao criar predição no Replicate." });
    }

    // Poll until finished (in case Prefer: wait timed out)
    const deadline = Date.now() + 55_000;
    while (["starting", "processing"].includes(prediction.status)) {
      if (Date.now() > deadline) break;
      await sleep(1500);
      const poll = await fetch(prediction.urls.get, {
        headers: { Authorization: `Bearer ${token}` },
      });
      prediction = await poll.json();
    }

    if (prediction.status !== "succeeded") {
      return res.status(502).json({
        error: prediction?.error || `Face swap não concluído (status: ${prediction.status}).`,
      });
    }

    const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (!output) return res.status(502).json({ error: "Sem imagem de saída." });

    res.status(200).json({ image: output });
  } catch (err) {
    console.error("faceswap error", err);
    res.status(500).json({ error: err.message || "Erro interno." });
  }
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// Robust JSON body reader (Vercel parses req.body, but read stream as fallback)
async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body) return JSON.parse(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}
