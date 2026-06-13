export function renderLandingPage() {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>YARA AI</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #020617;
        --panel: rgba(15, 23, 42, 0.76);
        --line: rgba(56, 189, 248, 0.34);
        --text: #e0f2fe;
        --muted: #94a3b8;
        --neon: #38bdf8;
        --ok: #34d399;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at 22% 18%, rgba(14, 165, 233, 0.22), transparent 32rem),
          radial-gradient(circle at 82% 80%, rgba(37, 99, 235, 0.16), transparent 28rem),
          linear-gradient(135deg, #020617 0%, #061b33 48%, #020617 100%);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      main {
        width: min(92vw, 760px);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: clamp(28px, 6vw, 56px);
        background: var(--panel);
        box-shadow: 0 0 48px rgba(56, 189, 248, 0.2);
        backdrop-filter: blur(18px);
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 24px;
        padding: 8px 12px;
        border: 1px solid rgba(52, 211, 153, 0.34);
        border-radius: 999px;
        color: #bbf7d0;
        background: rgba(6, 78, 59, 0.3);
        font-size: 14px;
        font-weight: 700;
      }

      .dot {
        width: 9px;
        height: 9px;
        border-radius: 999px;
        background: var(--ok);
        box-shadow: 0 0 16px var(--ok);
      }

      h1 {
        margin: 0;
        font-size: clamp(46px, 12vw, 96px);
        line-height: 0.9;
        letter-spacing: 0;
        color: #f0f9ff;
        text-shadow: 0 0 28px rgba(56, 189, 248, 0.4);
      }

      p {
        margin: 20px 0 0;
        max-width: 54ch;
        color: var(--muted);
        font-size: clamp(16px, 2.4vw, 19px);
        line-height: 1.7;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin-top: 34px;
      }

      a,
      .badge {
        min-height: 48px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        border: 1px solid rgba(125, 211, 252, 0.38);
        padding: 12px 18px;
        color: #e0f2fe;
        text-decoration: none;
        font-weight: 800;
        background: rgba(14, 165, 233, 0.14);
      }

      a {
        box-shadow: 0 0 24px rgba(56, 189, 248, 0.22);
      }

      .badge {
        color: #bae6fd;
        background: rgba(15, 23, 42, 0.78);
      }
    </style>
  </head>
  <body>
    <main>
      <div class="status"><span class="dot"></span>Status: Online</div>
      <h1>YARA AI</h1>
      <p>Backend oficial da YARA AI. A API esta funcionando e pronta para atender o aplicativo Android com comunicacao segura via Render.</p>
      <div class="actions">
        <span class="badge">API funcionando</span>
        <a href="/api/health">Ver /api/health</a>
      </div>
    </main>
  </body>
</html>`;
}

