# ⚽ Figurinha da Copa 2026 — Cabine interativa 🇧🇷

Página web para a **feira temática da Copa do Mundo**. Qualquer pessoa acessa o link,
envia uma foto de rosto e recebe uma figurinha estilo Panini 2026 com a **camisa amarela
do Brasil**, com **nome, nascimento, altura e peso editáveis**, o clube fixo em
**"COC BRASIL (BR)"**, podendo **baixar em alta resolução** e **receber por e-mail**.

## Como funciona

1. **Operador (você)** abre `⚙️ Configuração` e carrega **uma vez** a figurinha base
   (a foto do jogador na camisa do Brasil — pode ser a própria figurinha que você enviou).
   Ela fica salva no navegador do dispositivo da cabine.
2. **Visitante** tira/escolhe uma foto de rosto.
3. **"Gerar montagem"** → o rosto é trocado por IA (face swap) sobre a figurinha base.
4. Edita **nome / nascimento / altura / peso** (o clube já vem como `COC BRASIL (BR)`).
5. **Baixar em alta resolução** (PNG 2160×3024) e/ou **enviar por e-mail** (anexo em alta).

> Se a IA estiver indisponível, o app cai automaticamente no **modo Manual**:
> a pessoa encaixa o rosto com controles de zoom / posição / rotação. A cabine nunca para.

## Stack
- Front-end estático (`index.html` + `styles.css` + `app.js`) — sem build, abre em qualquer celular.
- Toda a figurinha é desenhada em `<canvas>`, então a exportação é idêntica à prévia.
- Backend serverless (Vercel): `api/faceswap.js` (Replicate) e `api/send-email.js` (Resend).

## Deploy no Vercel (gera o link público)

1. Importe o repositório `joseedson18jc/onworknewon` no Vercel.
2. Em **Project Settings → Root Directory**, defina **`worldcup`**.
3. Framework Preset: **Other** (não precisa de build; é estático + funções `/api`).
4. Em **Settings → Environment Variables**, adicione:

   | Variável | Obrigatória | Como obter / valor |
   |---|---|---|
   | `REPLICATE_API_TOKEN` | ✅ | https://replicate.com/account/api-tokens |
   | `RESEND_API_KEY` | ✅ | https://resend.com/api-keys |
   | `RESEND_FROM` | recomendada | `Figurinha Copa <figurinha@seu-dominio.com>` (domínio verificado no Resend). Sem domínio, o padrão `onboarding@resend.dev` só entrega para o seu próprio e-mail de teste. |
   | `REPLICATE_FACESWAP_MODEL` | opcional | padrão `cdingram/face-swap` |
   | `REPLICATE_SWAP_FIELD` | opcional | padrão `swap_image` (campo do rosto novo) |
   | `REPLICATE_TARGET_FIELD` | opcional | padrão `input_image` (campo da foto base) |

5. **Deploy**. O link público aparece (ex.: `https://sua-figurinha.vercel.app`).

### Sobre o modelo de face swap
O padrão é `cdingram/face-swap` no Replicate. Se quiser trocar por outro modelo,
ajuste `REPLICATE_FACESWAP_MODEL` e os nomes dos campos de entrada
(`REPLICATE_SWAP_FIELD` / `REPLICATE_TARGET_FIELD`) conforme a documentação do modelo —
sem alterar código.

### E-mail em alta resolução
O anexo é enviado como JPEG de alta qualidade (≈2160px) para caber no limite de corpo das
funções serverless do plano Hobby. Para impressão grande, use também o botão
**"Baixar em alta resolução"** (PNG sem perdas).

## Rodar localmente
```bash
npm i -g vercel
cd worldcup
vercel dev   # respeita as funções /api; defina as env vars no .env ou no prompt
```
Apenas o front-end (sem backend) pode ser aberto servindo a pasta com qualquer
servidor estático, mas o face swap e o e-mail precisam das funções `/api`.

## Privacidade
As fotos dos visitantes são enviadas ao Replicate apenas para gerar a montagem e
não são armazenadas por este app. A imagem base do operador fica só no navegador da cabine.
