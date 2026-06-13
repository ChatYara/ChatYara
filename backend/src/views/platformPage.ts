export function renderPlatformPage() {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>YARA AI | Plataforma</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #020617;
        --panel: rgba(15, 23, 42, 0.78);
        --line: rgba(125, 211, 252, 0.22);
        --text: #f0f9ff;
        --muted: #94a3b8;
        --neon: #38bdf8;
        --ok: #34d399;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        background:
          radial-gradient(circle at 18% 10%, rgba(14, 165, 233, 0.22), transparent 28rem),
          linear-gradient(135deg, #020617, #06172d 52%, #020617);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .layout {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 290px minmax(0, 1fr);
      }

      aside {
        border-right: 1px solid var(--line);
        padding: 24px;
        background: rgba(2, 6, 23, 0.76);
        backdrop-filter: blur(18px);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 26px;
        font-weight: 950;
      }

      .mark {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(125, 211, 252, 0.46);
        border-radius: 10px;
        background: rgba(14, 165, 233, 0.18);
        box-shadow: 0 0 24px rgba(56, 189, 248, 0.22);
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 48px;
        margin-bottom: 10px;
        border: 1px solid rgba(125, 211, 252, 0.14);
        border-radius: 8px;
        padding: 12px;
        color: #dbeafe;
        background: rgba(15, 23, 42, 0.48);
        font-weight: 800;
      }

      .nav-item.active {
        border-color: rgba(125, 211, 252, 0.52);
        background: rgba(14, 165, 233, 0.18);
      }

      main {
        padding: clamp(24px, 5vw, 56px);
      }

      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 28px;
      }

      h1 {
        margin: 0 0 8px;
        font-size: clamp(34px, 5vw, 64px);
        line-height: 1;
      }

      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.7;
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        border: 1px solid rgba(52, 211, 153, 0.34);
        border-radius: 999px;
        padding: 9px 12px;
        color: #bbf7d0;
        background: rgba(6, 78, 59, 0.24);
        font-size: 13px;
        font-weight: 900;
      }

      .dot {
        width: 9px;
        height: 9px;
        border-radius: 999px;
        background: var(--ok);
        box-shadow: 0 0 16px var(--ok);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }

      .card {
        min-height: 180px;
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 22px;
        background: var(--panel);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.26);
      }

      .card h2 {
        margin: 0 0 10px;
        color: #e0f2fe;
        font-size: 20px;
      }

      .button {
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(125, 211, 252, 0.42);
        border-radius: 8px;
        padding: 10px 14px;
        color: #00111f;
        background: linear-gradient(135deg, #7dd3fc, #38bdf8);
        font-weight: 900;
        text-decoration: none;
        cursor: pointer;
      }

      .logout {
        color: #e0f2fe;
        background: rgba(15, 23, 42, 0.72);
      }

      @media (max-width: 840px) {
        .layout { grid-template-columns: 1fr; }
        aside { border-right: 0; border-bottom: 1px solid var(--line); }
        .grid { grid-template-columns: 1fr; }
        header { align-items: flex-start; flex-direction: column; }
      }
    </style>
  </head>
  <body>
    <div class="layout">
      <aside>
        <div class="brand"><span class="mark">YA</span><span>YARA AI</span></div>
        <div class="nav-item active">Nova conversa</div>
        <div class="nav-item">Memoria</div>
        <div class="nav-item">Gerador de Sistemas</div>
        <div class="nav-item">Projetos</div>
        <div class="nav-item">Configuracoes</div>
      </aside>
      <main>
        <header>
          <div>
            <h1>Bem-vindo, <span id="userName">usuario</span>.</h1>
            <p>Area inicial da plataforma YARA AI conectada ao backend oficial Render.</p>
          </div>
          <div>
            <div class="status"><span class="dot"></span>YARA Online</div>
            <button class="button logout" id="logoutButton" type="button">Sair</button>
          </div>
        </header>
        <section class="grid">
          <article class="card"><h2>Nova conversa</h2><p>Inicie um fluxo com a YARA AI usando o backend seguro.</p></article>
          <article class="card"><h2>Memoria</h2><p>Organize contexto e preferencias para respostas melhores.</p></article>
          <article class="card"><h2>Gerador de Sistemas</h2><p>Crie web apps, APIs, dashboards, bancos e automacoes.</p></article>
          <article class="card"><h2>Projetos</h2><p>Acompanhe ideias e entregas geradas pela plataforma.</p></article>
          <article class="card"><h2>Configuracoes</h2><p>Gerencie perfil, sessao e status operacional.</p></article>
          <article class="card"><h2>Status</h2><p>API online em <a href="/api/health">/api/health</a>.</p></article>
        </section>
      </main>
    </div>
    <script>
      const token = localStorage.getItem("yaraToken");
      const userName = document.getElementById("userName");

      async function loadUser() {
        if (!token) {
          window.location.href = "/?auth=login";
          return;
        }

        try {
          const response = await fetch("/api/auth/me", {
            headers: { Authorization: "Bearer " + token }
          });

          if (!response.ok) throw new Error("invalid-session");
          const data = await response.json();
          userName.textContent = data.user.name;
        } catch {
          localStorage.removeItem("yaraToken");
          localStorage.removeItem("yaraUser");
          window.location.href = "/?auth=login";
        }
      }

      document.getElementById("logoutButton").addEventListener("click", () => {
        localStorage.removeItem("yaraToken");
        localStorage.removeItem("yaraUser");
        window.location.href = "/";
      });

      loadUser();
    </script>
  </body>
</html>`;
}

