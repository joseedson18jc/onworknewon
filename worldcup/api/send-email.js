/* =========================================================================
   POST /api/send-email
   Body: { to: string, name: string, image: dataURL (jpeg/png) }
   Sends the finished sticker as a high-res attachment via Resend.

   Env vars (set in Vercel project settings):
     RESEND_API_KEY  (required)  -> https://resend.com/api-keys
     RESEND_FROM     (optional)  default "Figurinha Copa <onboarding@resend.dev>"
                                  Use a verified domain for real delivery.
   ========================================================================= */

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "RESEND_API_KEY não configurado no servidor." });
    return;
  }

  try {
    const body = await readJson(req);
    const { to, name, image } = body || {};
    if (!to || !image) {
      res.status(400).json({ error: "to e image são obrigatórios." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      res.status(400).json({ error: "E-mail inválido." });
      return;
    }

    // strip data URL prefix -> raw base64 for the attachment
    const match = /^data:(image\/\w+);base64,(.+)$/.exec(image);
    if (!match) {
      res.status(400).json({ error: "Formato de imagem inválido." });
      return;
    }
    const ext = match[1] === "image/png" ? "png" : "jpg";
    const base64 = match[2];

    const from = process.env.RESEND_FROM || "Figurinha Copa 2026 <onboarding@resend.dev>";
    const playerName = (name || "Craque").trim();
    const fileName = `figurinha-copa-2026-${slug(playerName)}.${ext}`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `🇧🇷 Sua figurinha da Copa 2026 — ${playerName}`,
        html: emailHtml(playerName),
        attachments: [{ filename: fileName, content: base64 }],
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error("resend error", data);
      return res.status(502).json({ error: data?.message || "Erro ao enviar e-mail." });
    }

    res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    console.error("send-email error", err);
    res.status(500).json({ error: err.message || "Erro interno." });
  }
}

function slug(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "figurinha";
}

function emailHtml(name) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:auto;background:#0a1f44;border-radius:16px;overflow:hidden;color:#eaf2ff">
    <div style="padding:28px 24px;text-align:center">
      <div style="font-size:34px">⚽🇧🇷</div>
      <h1 style="margin:8px 0 4px;font-size:22px;color:#ffd000">Sua figurinha está pronta!</h1>
      <p style="margin:0;color:#b9cdf0;font-size:15px">
        Parabéns, <strong style="color:#fff">${escapeHtml(name)}</strong>! Você entrou pro álbum da Copa do Mundo 2026
        com a camisa do Brasil.
      </p>
      <p style="margin:18px 0 0;color:#b9cdf0;font-size:14px">
        Sua figurinha em alta resolução está anexada a este e-mail. 📎<br/>
        Imprima, compartilhe e cole no álbum!
      </p>
      <p style="margin:24px 0 0;color:#7e96c2;font-size:12px">Feira temática da Copa do Mundo · COC Brasil</p>
    </div>
  </div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body) return JSON.parse(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}
