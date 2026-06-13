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
        --panel: rgba(15, 23, 42, 0.76);
        --line: rgba(125, 211, 252, 0.22);
        --text: #f0f9ff;
        --muted: #9fb2c8;
        --neon: #38bdf8;
        --neon-strong: #7dd3fc;
        --ok: #34d399;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        background:
          radial-gradient(circle at 18% 8%, rgba(14, 165, 233, 0.24), transparent 30rem),
          radial-gradient(circle at 88% 18%, rgba(37, 99, 235, 0.18), transparent 28rem),
          linear-gradient(135deg, #020617, #07172d 52%, #020617);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      svg {
        width: 20px;
        height: 20px;
        flex: 0 0 auto;
      }

      .layout {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 292px minmax(0, 1fr);
      }

      aside {
        position: sticky;
        top: 0;
        height: 100vh;
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--line);
        padding: 24px;
        background: rgba(2, 6, 23, 0.78);
        backdrop-filter: blur(18px);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 28px;
      }

      .mark {
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(125, 211, 252, 0.52);
        border-radius: 12px;
        color: #e0f2fe;
        background: linear-gradient(145deg, rgba(56, 189, 248, 0.28), rgba(15, 23, 42, 0.88));
        box-shadow: 0 0 26px rgba(56, 189, 248, 0.24), inset 0 0 16px rgba(125, 211, 252, 0.12);
        font-weight: 950;
      }

      .brand strong {
        display: block;
        font-size: 18px;
      }

      .brand span:last-child {
        display: block;
        margin-top: 3px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
      }

      .nav {
        display: grid;
        gap: 10px;
      }

      .nav-item,
      .logout {
        min-height: 50px;
        display: flex;
        align-items: center;
        gap: 12px;
        border: 1px solid rgba(125, 211, 252, 0.14);
        border-radius: 10px;
        padding: 12px;
        color: #dbeafe;
        background: rgba(15, 23, 42, 0.48);
        font-weight: 850;
      }

      .nav-item.active {
        border-color: rgba(125, 211, 252, 0.52);
        background: rgba(14, 165, 233, 0.18);
        box-shadow: 0 0 24px rgba(56, 189, 248, 0.12);
      }

      .logout {
        width: 100%;
        margin-top: auto;
        cursor: pointer;
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
        margin: 0 0 10px;
        font-size: clamp(34px, 5vw, 62px);
        line-height: 1;
        letter-spacing: 0;
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

      .hero-panel {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
        gap: 18px;
        margin-bottom: 20px;
      }

      .panel,
      .card {
        border: 1px solid var(--line);
        border-radius: 16px;
        background: var(--panel);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28), 0 0 32px rgba(56, 189, 248, 0.08);
        backdrop-filter: blur(18px);
      }

      .panel {
        padding: clamp(22px, 4vw, 34px);
      }

      .panel h2 {
        margin: 0 0 10px;
        font-size: clamp(24px, 3vw, 38px);
      }

      .quick {
        display: grid;
        gap: 10px;
      }

      .quick-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        border: 1px solid rgba(125, 211, 252, 0.14);
        border-radius: 10px;
        padding: 14px;
        background: rgba(2, 6, 23, 0.38);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 16px;
      }

      .card {
        min-height: 218px;
        display: flex;
        flex-direction: column;
        padding: 20px;
        transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
      }

      .card:hover {
        transform: translateY(-6px);
        border-color: rgba(125, 211, 252, 0.58);
        background: rgba(15, 23, 42, 0.86);
      }

      .icon-box {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(125, 211, 252, 0.26);
        border-radius: 12px;
        color: #bae6fd;
        background: rgba(14, 165, 233, 0.14);
      }

      .card h2 {
        margin: 16px 0 8px;
        color: #e0f2fe;
        font-size: 19px;
      }

      .card p {
        flex: 1;
        font-size: 14px;
      }

      .button {
        min-height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(125, 211, 252, 0.42);
        border-radius: 9px;
        padding: 9px 12px;
        color: #00111f;
        background: linear-gradient(135deg, #7dd3fc, #38bdf8);
        font-weight: 900;
        text-decoration: none;
        cursor: pointer;
      }

      .button.ghost {
        color: #e0f2fe;
        background: rgba(15, 23, 42, 0.72);
      }

      @media (max-width: 1120px) {
        .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }

      @media (max-width: 860px) {
        .layout { grid-template-columns: 1fr; }
        aside {
          position: static;
          height: auto;
          border-right: 0;
          border-bottom: 1px solid var(--line);
        }
        .hero-panel { grid-template-columns: 1fr; }
        header { align-items: flex-start; flex-direction: column; }
      }

      @media (max-width: 620px) {
        main { padding: 18px; }
        .grid { grid-template-columns: 1fr; }
        .quick-row { align-items: flex-start; flex-direction: column; }
      }
    </style>
  </head>
  <body>
    <div class="layout">
      <aside>
        <div class="brand">
          <span class="mark">YA</span>
          <div><strong>YARA AI</strong><span>Plataforma inteligente</span></div>
        </div>
        <nav class="nav" aria-label="Navegação da plataforma">
          <div class="nav-item active">${icon("chat")}Nova conversa</div>
          <div class="nav-item">${icon("brain")}Memória</div>
          <div class="nav-item">${icon("code")}Gerador de Sistemas</div>
          <div class="nav-item">${icon("folder")}Projetos</div>
          <div class="nav-item">${icon("settings")}Configurações</div>
        </nav>
        <button class="logout" id="logoutButton" type="button">${icon("logout")}Sair</button>
      </aside>
      <main>
        <header>
          <div>
            <h1>Bem-vindo, <span id="userName">usuário</span></h1>
            <p>Seu espaço para conversar, organizar ideias e transformar projetos em soluções reais.</p>
          </div>
          <div class="status"><span class="dot"></span>YARA Online</div>
        </header>

        <section class="hero-panel">
          <article class="panel">
            <h2>O que vamos criar hoje?</h2>
            <p>Use a YARA AI para iniciar uma conversa, planejar um sistema, organizar memória ou continuar um projeto.</p>
          </article>
          <article class="panel quick" aria-label="Ações rápidas">
            <div class="quick-row"><span>Começar nova conversa</span><button class="button" type="button">Abrir</button></div>
            <div class="quick-row"><span>Gerar estrutura de sistema</span><button class="button ghost" type="button">Planejar</button></div>
          </article>
        </section>

        <section class="grid" aria-label="Recursos principais">
          ${dashboardCard("chat", "Nova conversa", "Converse com a YARA para tirar ideias do papel com clareza.", "Conversar")}
          ${dashboardCard("code", "Gerador de Sistemas", "Crie web apps, APIs, dashboards, bancos e automações.", "Gerar")}
          ${dashboardCard("folder", "Meus Projetos", "Acompanhe ideias, escopos e entregas em um só lugar.", "Ver projetos")}
          ${dashboardCard("brain", "Memória", "Guarde contexto importante para evoluir respostas e decisões.", "Organizar")}
          ${dashboardCard("settings", "Configurações", "Gerencie sua conta, preferências e experiência da plataforma.", "Abrir")}
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

function dashboardCard(iconName: IconName, title: string, description: string, action: string) {
  return `<article class="card">
    <span class="icon-box">${icon(iconName)}</span>
    <h2>${title}</h2>
    <p>${description}</p>
    <button class="button ghost" type="button">${action}</button>
  </article>`;
}

type IconName = "chat" | "brain" | "code" | "folder" | "settings" | "logout";

function icon(name: IconName) {
  const icons: Record<IconName, string> = {
    chat: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v4A3.5 3.5 0 0 1 15.5 14H11l-4.5 4v-4A3.5 3.5 0 0 1 3 10.5v-4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    brain: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 4.5A3 3 0 0 0 6 7.5v.2A3.4 3.4 0 0 0 4 11a3.4 3.4 0 0 0 2 3.1v.4A3 3 0 0 0 9 17.5h1V4.5H9Zm6 0a3 3 0 0 1 3 3v.2A3.4 3.4 0 0 1 20 11a3.4 3.4 0 0 1-2 3.1v.4a3 3 0 0 1-3 3h-1V4.5h1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 9h2m4 0h2M8 13h2m4 0h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 8-4 4 4 4m8-8 4 4-4 4m-2.5-10-3 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 18 18H6a2.5 2.5 0 0 1-2.5-2.5v-8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" stroke-width="1.8"/><path d="M19 13.3v-2.6l-2-.7a5.7 5.7 0 0 0-.7-1.6l.9-1.9-1.8-1.8-1.9.9a5.7 5.7 0 0 0-1.6-.7L11.3 3H8.7L8 5a5.7 5.7 0 0 0-1.6.7l-1.9-.9-1.8 1.8.9 1.9A5.7 5.7 0 0 0 3 10.1l-2 .6v2.6l2 .7c.2.6.4 1.1.7 1.6l-.9 1.9 1.8 1.8 1.9-.9c.5.3 1 .5 1.6.7l.6 2h2.6l.7-2c.6-.2 1.1-.4 1.6-.7l1.9.9 1.8-1.8-.9-1.9c.3-.5.5-1 .7-1.6l1.9-.7Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 6H6.5A2.5 2.5 0 0 0 4 8.5v7A2.5 2.5 0 0 0 6.5 18H10m4-3 3-3-3-3m3 3H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  return icons[name];
}

