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
        --surface: rgba(8, 14, 30, 0.82);
        --panel: rgba(15, 23, 42, 0.72);
        --panel-strong: rgba(15, 23, 42, 0.9);
        --line: rgba(125, 211, 252, 0.2);
        --line-strong: rgba(125, 211, 252, 0.46);
        --text: #f1f8ff;
        --muted: #9cb5cb;
        --neon: #38bdf8;
        --neon-strong: #7dd3fc;
        --ok: #34d399;
        --danger: #fb7185;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        overflow: hidden;
        background:
          radial-gradient(circle at 12% 10%, rgba(14, 165, 233, 0.24), transparent 28rem),
          radial-gradient(circle at 82% 12%, rgba(29, 78, 216, 0.2), transparent 30rem),
          linear-gradient(145deg, #020617, #07172d 48%, #020617);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      button,
      input,
      select,
      textarea {
        font: inherit;
      }

      button {
        cursor: pointer;
      }

      svg {
        width: 20px;
        height: 20px;
        flex: 0 0 auto;
      }

      .app-shell {
        height: 100vh;
        display: grid;
        grid-template-columns: 308px minmax(0, 1fr);
      }

      .sidebar {
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 18px;
        border-right: 1px solid var(--line);
        padding: 22px;
        background: rgba(2, 6, 23, 0.78);
        backdrop-filter: blur(22px);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .logo-img {
        width: 46px;
        height: 46px;
        display: none;
        object-fit: contain;
      }

      .mark {
        width: 46px;
        height: 46px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(125, 211, 252, 0.55);
        border-radius: 14px;
        color: #e0f2fe;
        background: linear-gradient(145deg, rgba(56, 189, 248, 0.3), rgba(15, 23, 42, 0.9));
        box-shadow: 0 0 28px rgba(56, 189, 248, 0.25), inset 0 0 18px rgba(125, 211, 252, 0.12);
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
        font-weight: 750;
      }

      .primary-action,
      .button {
        min-height: 42px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        border: 1px solid rgba(125, 211, 252, 0.44);
        border-radius: 11px;
        padding: 10px 14px;
        color: #00111f;
        background: linear-gradient(135deg, #7dd3fc, #38bdf8 52%, #0ea5e9);
        box-shadow: 0 0 26px rgba(56, 189, 248, 0.18);
        font-weight: 900;
        text-decoration: none;
      }

      .button.ghost,
      .icon-button {
        color: #dff7ff;
        background: rgba(15, 23, 42, 0.66);
        box-shadow: none;
      }

      .button.danger,
      .icon-button.danger {
        border-color: rgba(251, 113, 133, 0.34);
        color: #fecdd3;
      }

      .nav {
        display: grid;
        gap: 9px;
      }

      .nav-button,
      .conversation-button {
        width: 100%;
        min-height: 46px;
        display: flex;
        align-items: center;
        gap: 11px;
        border: 1px solid rgba(125, 211, 252, 0.12);
        border-radius: 12px;
        padding: 11px 12px;
        color: #dbeafe;
        background: rgba(15, 23, 42, 0.4);
        text-align: left;
        font-weight: 800;
      }

      .nav-button.active,
      .conversation-button.active {
        border-color: var(--line-strong);
        background: rgba(14, 165, 233, 0.17);
        box-shadow: 0 0 22px rgba(56, 189, 248, 0.12);
      }

      .sidebar-section {
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .section-title {
        margin: 0;
        color: #bfd7eb;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .conversation-list {
        min-height: 0;
        display: grid;
        gap: 8px;
        overflow: auto;
        padding-right: 3px;
      }

      .conversation-button {
        min-height: 42px;
        font-size: 13px;
        overflow: hidden;
      }

      .conversation-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .account {
        margin-top: auto;
        display: grid;
        gap: 10px;
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 14px;
        background: rgba(15, 23, 42, 0.48);
      }

      .account strong {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .account span {
        color: var(--muted);
        font-size: 12px;
      }

      .main {
        min-width: 0;
        min-height: 0;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        border-bottom: 1px solid var(--line);
        padding: 18px clamp(18px, 4vw, 34px);
        background: rgba(2, 6, 23, 0.4);
        backdrop-filter: blur(18px);
      }

      .topbar h1 {
        margin: 0 0 4px;
        font-size: clamp(22px, 3vw, 34px);
        letter-spacing: 0;
      }

      .topbar p {
        margin: 0;
        color: var(--muted);
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        border: 1px solid rgba(52, 211, 153, 0.34);
        border-radius: 999px;
        padding: 9px 12px;
        color: #bbf7d0;
        background: rgba(6, 78, 59, 0.22);
        font-size: 13px;
        font-weight: 900;
        white-space: nowrap;
      }

      .dot {
        width: 9px;
        height: 9px;
        border-radius: 999px;
        background: var(--ok);
        box-shadow: 0 0 16px var(--ok);
      }

      .view {
        min-height: 0;
        overflow: auto;
        padding: clamp(18px, 4vw, 34px);
      }

      .view[hidden] {
        display: none;
      }

      .chat-view {
        min-height: 0;
        display: grid;
        grid-template-rows: minmax(0, 1fr) auto;
        gap: 16px;
      }

      .messages {
        min-height: 360px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        overflow: auto;
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: clamp(16px, 3vw, 26px);
        background: var(--surface);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
      }

      .empty-chat {
        margin: auto;
        max-width: 640px;
        text-align: center;
      }

      .empty-chat h2 {
        margin: 0 0 10px;
        font-size: clamp(30px, 5vw, 58px);
      }

      .empty-chat p {
        margin: 0;
        color: var(--muted);
        line-height: 1.7;
      }

      .message {
        max-width: min(760px, 86%);
        border: 1px solid rgba(125, 211, 252, 0.18);
        border-radius: 18px;
        padding: 14px 16px;
        background: rgba(15, 23, 42, 0.66);
        line-height: 1.65;
        white-space: pre-wrap;
      }

      .message.user {
        align-self: flex-end;
        border-color: rgba(125, 211, 252, 0.42);
        background: linear-gradient(145deg, rgba(14, 165, 233, 0.24), rgba(15, 23, 42, 0.76));
      }

      .message.assistant {
        align-self: flex-start;
      }

      .message small {
        display: block;
        margin-bottom: 6px;
        color: #bae6fd;
        font-weight: 900;
      }

      .composer {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 10px;
        border: 1px solid var(--line-strong);
        border-radius: 18px;
        padding: 10px;
        background: rgba(2, 6, 23, 0.75);
        box-shadow: 0 0 34px rgba(56, 189, 248, 0.1);
      }

      .composer textarea,
      .field,
      .select {
        width: 100%;
        border: 1px solid rgba(125, 211, 252, 0.18);
        border-radius: 12px;
        padding: 12px 13px;
        color: var(--text);
        background: rgba(15, 23, 42, 0.72);
        outline: none;
      }

      .composer textarea {
        min-height: 48px;
        max-height: 140px;
        resize: vertical;
        border: 0;
        background: transparent;
      }

      .composer textarea:focus,
      .field:focus,
      .select:focus {
        border-color: var(--line-strong);
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
      }

      .workspace-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }

      .card,
      .panel {
        border: 1px solid var(--line);
        border-radius: 18px;
        background: var(--panel);
        box-shadow: 0 22px 66px rgba(0, 0, 0, 0.22), 0 0 30px rgba(56, 189, 248, 0.07);
        backdrop-filter: blur(18px);
      }

      .card {
        min-height: 204px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 18px;
        transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
      }

      .card:hover {
        transform: translateY(-5px);
        border-color: var(--line-strong);
        background: var(--panel-strong);
      }

      .icon-box {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(125, 211, 252, 0.28);
        border-radius: 13px;
        color: #bae6fd;
        background: rgba(14, 165, 233, 0.14);
      }

      .card h2,
      .panel h2 {
        margin: 0;
        color: #e0f2fe;
        font-size: 20px;
      }

      .card p,
      .panel p,
      .muted {
        margin: 0;
        color: var(--muted);
        line-height: 1.7;
      }

      .card .button {
        margin-top: auto;
        align-self: flex-start;
      }

      .panel {
        display: grid;
        gap: 14px;
        padding: clamp(18px, 3vw, 26px);
      }

      .two-column {
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
        gap: 18px;
      }

      .stack {
        display: grid;
        gap: 12px;
      }

      .list {
        display: grid;
        gap: 12px;
      }

      .list-item {
        display: grid;
        gap: 8px;
        border: 1px solid rgba(125, 211, 252, 0.14);
        border-radius: 14px;
        padding: 14px;
        background: rgba(2, 6, 23, 0.34);
      }

      .item-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
      }

      .item-top strong {
        color: #e0f2fe;
      }

      .result-box {
        min-height: 220px;
        max-height: 520px;
        overflow: auto;
        border: 1px solid rgba(125, 211, 252, 0.16);
        border-radius: 14px;
        padding: 16px;
        background: rgba(2, 6, 23, 0.38);
        white-space: pre-wrap;
        line-height: 1.7;
      }

      .toast {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 50;
        max-width: 380px;
        display: none;
        border: 1px solid var(--line-strong);
        border-radius: 14px;
        padding: 13px 15px;
        color: #e0f2fe;
        background: rgba(2, 6, 23, 0.92);
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.32);
      }

      .toast.show {
        display: block;
      }

      .mobile-toggle {
        display: none;
      }

      @media (max-width: 1120px) {
        .workspace-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .two-column { grid-template-columns: 1fr; }
      }

      @media (max-width: 860px) {
        body { overflow: auto; }
        .app-shell { min-height: 100vh; height: auto; grid-template-columns: 1fr; }
        .sidebar {
          position: sticky;
          top: 0;
          z-index: 20;
          border-right: 0;
          border-bottom: 1px solid var(--line);
        }
        .mobile-toggle {
          display: inline-flex;
          margin-left: auto;
        }
        .sidebar-body {
          display: none;
        }
        .sidebar.open .sidebar-body {
          display: grid;
          gap: 16px;
        }
        .main { min-height: calc(100vh - 92px); }
        .topbar { align-items: flex-start; flex-direction: column; }
      }

      @media (max-width: 620px) {
        .sidebar,
        .view,
        .topbar { padding: 16px; }
        .workspace-grid { grid-template-columns: 1fr; }
        .composer { grid-template-columns: 1fr; }
        .message { max-width: 100%; }
        .button { width: 100%; }
      }
    </style>
  </head>
  <body>
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <img class="logo-img" src="/assets/yara-logo.png" alt="YARA AI" onload="this.style.display='block'; this.nextElementSibling.style.display='none';" />
          <span class="mark">YA</span>
          <div><strong>YARA AI</strong><span>Plataforma inteligente</span></div>
          <button class="icon-button mobile-toggle" id="mobileToggle" type="button" aria-label="Abrir menu">${icon("menu")}</button>
        </div>
        <div class="sidebar-body">
          <button class="primary-action" id="newConversationButton" type="button">${icon("plus")}Nova conversa</button>
          <nav class="nav" aria-label="Navegação">
            ${navButton("chat", "Chat", "chat", true)}
            ${navButton("memory", "Memória", "brain")}
            ${navButton("generator", "Gerador", "code")}
            ${navButton("projects", "Projetos", "folder")}
            ${navButton("settings", "Configurações", "settings")}
          </nav>
          <section class="sidebar-section">
            <p class="section-title">Histórico</p>
            <div class="conversation-list" id="conversationList"></div>
          </section>
          <section class="account">
            <div>
              <strong id="accountName">Usuário</strong>
              <span id="accountEmail">Conta YARA</span>
            </div>
            <button class="button ghost" id="logoutButton" type="button">${icon("logout")}Sair</button>
          </section>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div>
            <h1 id="pageTitle">Bem-vindo</h1>
            <p id="pageSubtitle">Seu espaço para conversar, criar sistemas e organizar projetos.</p>
          </div>
          <div class="status"><span class="dot"></span>YARA Online</div>
        </header>

        <section class="view chat-view" id="view-chat">
          <div class="messages" id="messages">
            <div class="empty-chat">
              <h2>Sua inteligência. Sem limites.</h2>
              <p>Comece uma conversa, peça um plano de sistema ou continue uma ideia salva. A YARA mantém o contexto do seu espaço de trabalho.</p>
            </div>
          </div>
          <form class="composer" id="chatForm">
            <textarea id="messageInput" placeholder="Digite sua mensagem..." rows="1" autocomplete="off"></textarea>
            <button class="primary-action" type="submit" aria-label="Enviar mensagem">${icon("send")}</button>
          </form>
        </section>

        <section class="view" id="view-generator" hidden>
          <div class="two-column">
            <form class="panel" id="generatorForm">
              <span class="icon-box">${icon("code")}</span>
              <h2>Gerador de Sistemas</h2>
              <p>Descreva o que você precisa. A YARA organiza a arquitetura, módulos, telas, dados e próximos passos.</p>
              <select class="select" id="systemType">
                <option>Criar Web App</option>
                <option>Criar API REST</option>
                <option>Criar Dashboard</option>
                <option>Criar Banco de Dados</option>
                <option>Criar Mobile App</option>
                <option>Automação</option>
              </select>
              <textarea class="field" id="generatorPrompt" rows="8" placeholder="Exemplo: Quero um sistema de estoque com login, cadastro de produtos, alertas e painel administrativo."></textarea>
              <button class="primary-action" type="submit">${icon("sparkles")}Gerar sistema</button>
            </form>
            <article class="panel">
              <h2>Resultado</h2>
              <div class="result-box" id="generatorResult">O plano gerado aparecerá aqui.</div>
            </article>
          </div>
        </section>

        <section class="view" id="view-projects" hidden>
          <div class="two-column">
            <form class="panel" id="projectForm">
              <span class="icon-box">${icon("folder")}</span>
              <h2>Novo projeto</h2>
              <input class="field" id="projectName" placeholder="Nome do projeto" />
              <textarea class="field" id="projectDescription" rows="5" placeholder="Descreva a ideia, escopo ou próximo passo."></textarea>
              <button class="primary-action" type="submit">${icon("plus")}Salvar projeto</button>
            </form>
            <article class="panel">
              <h2>Meus Projetos</h2>
              <div class="list" id="projectList"></div>
            </article>
          </div>
        </section>

        <section class="view" id="view-memory" hidden>
          <div class="two-column">
            <form class="panel" id="memoryForm">
              <span class="icon-box">${icon("brain")}</span>
              <h2>Memória da YARA</h2>
              <p>Salve preferências, contexto da empresa, padrões de projeto ou informações importantes.</p>
              <input class="field" id="memoryTitle" placeholder="Título opcional" />
              <textarea class="field" id="memoryContent" rows="6" placeholder="O que a YARA deve lembrar?"></textarea>
              <button class="primary-action" type="submit">${icon("plus")}Salvar memória</button>
            </form>
            <article class="panel">
              <h2>Memórias salvas</h2>
              <div class="list" id="memoryList"></div>
            </article>
          </div>
        </section>

        <section class="view" id="view-settings" hidden>
          <div class="two-column">
            <form class="panel" id="settingsForm">
              <span class="icon-box">${icon("settings")}</span>
              <h2>Configurações</h2>
              <label class="stack">
                <span class="muted">Como você quer ser chamado?</span>
                <input class="field" id="displayName" placeholder="Seu nome na YARA" />
              </label>
              <label class="stack">
                <span class="muted">Estilo da YARA</span>
                <select class="select" id="aiStyle">
                  <option value="balanced">Equilibrada</option>
                  <option value="direct">Direta</option>
                  <option value="creative">Criativa</option>
                  <option value="technical">Técnica</option>
                </select>
              </label>
              <button class="primary-action" type="submit">${icon("save")}Salvar preferências</button>
            </form>
            <article class="panel">
              <h2>Conta protegida</h2>
              <p>Suas informações ficam conectadas à sua sessão segura. A inteligência da YARA é acessada por uma camada protegida no servidor.</p>
              <div class="workspace-grid">
                ${miniCard("shield", "Segurança", "Sessão autenticada e dados protegidos.")}
                ${miniCard("brain", "Contexto", "Memórias ajudam a YARA a responder melhor.")}
                ${miniCard("folder", "Organização", "Projetos e conversas ficam no seu espaço.")}
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
    <div class="toast" id="toast"></div>
    <script>
      const token = localStorage.getItem("yaraToken");
      let currentUser = null;
      let currentConversationId = null;
      let currentView = "chat";

      const els = {
        accountName: document.getElementById("accountName"),
        accountEmail: document.getElementById("accountEmail"),
        pageTitle: document.getElementById("pageTitle"),
        pageSubtitle: document.getElementById("pageSubtitle"),
        conversationList: document.getElementById("conversationList"),
        messages: document.getElementById("messages"),
        messageInput: document.getElementById("messageInput"),
        toast: document.getElementById("toast"),
        sidebar: document.getElementById("sidebar")
      };

      function api(path, options) {
        const headers = Object.assign(
          { "Content-Type": "application/json", Authorization: "Bearer " + token },
          options && options.headers ? options.headers : {}
        );
        return fetch(path, Object.assign({}, options || {}, { headers })).then(async function(response) {
          const data = await response.json().catch(function() { return {}; });
          if (!response.ok) {
            const message = data.error && data.error.message ? data.error.message : "Não foi possível concluir a ação.";
            throw new Error(message);
          }
          return data;
        });
      }

      function escapeHtml(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      function showToast(message) {
        els.toast.textContent = message;
        els.toast.classList.add("show");
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(function() {
          els.toast.classList.remove("show");
        }, 3600);
      }

      function requireSession() {
        if (!token) {
          window.location.href = "/?auth=login";
          return false;
        }
        return true;
      }

      function setView(view) {
        currentView = view;
        document.querySelectorAll(".view").forEach(function(item) {
          item.hidden = item.id !== "view-" + view;
        });
        document.querySelectorAll(".nav-button").forEach(function(item) {
          item.classList.toggle("active", item.dataset.view === view);
        });

        const labels = {
          chat: ["Bem-vindo, " + (currentUser ? currentUser.name : "usuário"), "Converse com a YARA e transforme ideias em ação."],
          generator: ["Gerador de Sistemas", "Crie planos completos para produtos digitais."],
          projects: ["Meus Projetos", "Organize ideias, escopos e entregas."],
          memory: ["Memória", "Guarde contexto para respostas mais inteligentes."],
          settings: ["Configurações", "Ajuste sua experiência na plataforma."]
        };
        els.pageTitle.textContent = labels[view][0];
        els.pageSubtitle.textContent = labels[view][1];
        els.sidebar.classList.remove("open");

        if (view === "projects") loadProjects();
        if (view === "memory") loadMemories();
        if (view === "settings") loadSettings();
      }

      function renderConversations(conversations) {
        if (!conversations.length) {
          els.conversationList.innerHTML = '<p class="muted">Nenhuma conversa ainda.</p>';
          return;
        }

        els.conversationList.innerHTML = conversations.map(function(item) {
          return '<button class="conversation-button ' + (item.id === currentConversationId ? "active" : "") + '" data-conversation="' + item.id + '" type="button"><span class="conversation-title">' + escapeHtml(item.title) + '</span></button>';
        }).join("");
      }

      async function loadConversations() {
        const data = await api("/api/conversations");
        renderConversations(data.conversations || []);
      }

      function renderMessages(messages) {
        if (!messages.length) {
          els.messages.innerHTML = '<div class="empty-chat"><h2>Sua inteligência. Sem limites.</h2><p>Envie uma mensagem para começar uma nova conversa com a YARA.</p></div>';
          return;
        }

        els.messages.innerHTML = messages.map(function(message) {
          const who = message.role === "user" ? "Você" : "YARA";
          return '<article class="message ' + message.role + '"><small>' + who + '</small>' + escapeHtml(message.content) + '</article>';
        }).join("");
        els.messages.scrollTop = els.messages.scrollHeight;
      }

      async function openConversation(id) {
        const data = await api("/api/conversations/" + id);
        currentConversationId = data.conversation.id;
        renderMessages(data.messages || []);
        await loadConversations();
        setView("chat");
      }

      async function newConversation() {
        const data = await api("/api/conversations", {
          method: "POST",
          body: JSON.stringify({ title: "Nova conversa" })
        });
        currentConversationId = data.conversation.id;
        renderMessages([]);
        await loadConversations();
        setView("chat");
        els.messageInput.focus();
      }

      async function sendMessage(event) {
        event.preventDefault();
        const message = els.messageInput.value.trim();
        if (!message) return;

        els.messageInput.value = "";
        const existing = Array.from(els.messages.querySelectorAll(".message")).map(function(node) {
          return { role: node.classList.contains("user") ? "user" : "assistant", content: node.textContent.replace(/^(Você|YARA)/, "").trim() };
        });
        renderMessages(existing.concat([{ role: "user", content: message }, { role: "assistant", content: "YARA está pensando..." }]));

        try {
          const data = await api("/api/chat", {
            method: "POST",
            body: JSON.stringify({ conversationId: currentConversationId || undefined, message: message })
          });
          currentConversationId = data.conversationId;
          const conversation = await api("/api/conversations/" + currentConversationId);
          renderMessages(conversation.messages || []);
          await loadConversations();
        } catch (error) {
          showToast(error.message);
          if (currentConversationId) {
            const conversation = await api("/api/conversations/" + currentConversationId).catch(function() { return { messages: [] }; });
            renderMessages(conversation.messages || []);
          } else {
            renderMessages([]);
          }
        }
      }

      async function loadProjects() {
        const data = await api("/api/projects");
        const projects = data.projects || [];
        const target = document.getElementById("projectList");
        if (!projects.length) {
          target.innerHTML = '<p class="muted">Nenhum projeto salvo ainda.</p>';
          return;
        }
        target.innerHTML = projects.map(function(project) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(project.name) + '</strong><button class="icon-button danger" data-delete-project="' + project.id + '" type="button" aria-label="Excluir projeto">${icon("trash")}</button></div><p class="muted">' + escapeHtml(project.description || project.prompt || "Projeto YARA AI") + '</p></article>';
        }).join("");
      }

      async function loadMemories() {
        const data = await api("/api/memories");
        const memories = data.memories || [];
        const target = document.getElementById("memoryList");
        if (!memories.length) {
          target.innerHTML = '<p class="muted">Nenhuma memória salva ainda.</p>';
          return;
        }
        target.innerHTML = memories.map(function(memory) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(memory.title || "Memória") + '</strong><button class="icon-button danger" data-delete-memory="' + memory.id + '" type="button" aria-label="Excluir memória">${icon("trash")}</button></div><p class="muted">' + escapeHtml(memory.content) + '</p></article>';
        }).join("");
      }

      async function loadSettings() {
        const data = await api("/api/settings");
        document.getElementById("displayName").value = data.settings.display_name || (currentUser ? currentUser.name : "");
        document.getElementById("aiStyle").value = data.settings.ai_style || "balanced";
      }

      async function init() {
        if (!requireSession()) return;
        try {
          const data = await api("/api/auth/me");
          currentUser = data.user;
          els.accountName.textContent = data.user.name;
          els.accountEmail.textContent = data.user.email;
          setView("chat");
          await loadConversations();
        } catch (error) {
          localStorage.removeItem("yaraToken");
          localStorage.removeItem("yaraUser");
          window.location.href = "/?auth=login";
        }
      }

      document.querySelectorAll(".nav-button").forEach(function(button) {
        button.addEventListener("click", function() {
          setView(button.dataset.view);
        });
      });

      els.conversationList.addEventListener("click", function(event) {
        const button = event.target.closest("[data-conversation]");
        if (button) openConversation(button.dataset.conversation);
      });

      document.getElementById("newConversationButton").addEventListener("click", newConversation);
      document.getElementById("chatForm").addEventListener("submit", sendMessage);
      document.getElementById("mobileToggle").addEventListener("click", function() {
        els.sidebar.classList.toggle("open");
      });

      document.getElementById("generatorForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        const prompt = document.getElementById("generatorPrompt").value.trim();
        const type = document.getElementById("systemType").value;
        if (prompt.length < 8) {
          showToast("Descreva melhor o sistema que você quer criar.");
          return;
        }
        const result = document.getElementById("generatorResult");
        result.textContent = "A YARA está estruturando o sistema...";
        try {
          const data = await api("/api/generator", {
            method: "POST",
            body: JSON.stringify({ type: type, prompt: prompt })
          });
          result.textContent = data.project.content || data.project.output;
          document.getElementById("generatorPrompt").value = "";
          showToast("Sistema gerado e salvo em projetos.");
        } catch (error) {
          result.textContent = "Não foi possível gerar agora.";
          showToast(error.message);
        }
      });

      document.getElementById("projectForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        const name = document.getElementById("projectName").value.trim();
        const description = document.getElementById("projectDescription").value.trim();
        if (!name) {
          showToast("Informe o nome do projeto.");
          return;
        }
        await api("/api/projects", {
          method: "POST",
          body: JSON.stringify({ name: name, description: description, content: description })
        });
        document.getElementById("projectName").value = "";
        document.getElementById("projectDescription").value = "";
        showToast("Projeto salvo.");
        loadProjects();
      });

      document.getElementById("projectList").addEventListener("click", async function(event) {
        const button = event.target.closest("[data-delete-project]");
        if (!button) return;
        await api("/api/projects/" + button.dataset.deleteProject, { method: "DELETE" });
        showToast("Projeto removido.");
        loadProjects();
      });

      document.getElementById("memoryForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        const title = document.getElementById("memoryTitle").value.trim();
        const content = document.getElementById("memoryContent").value.trim();
        if (content.length < 2) {
          showToast("Escreva uma memória para salvar.");
          return;
        }
        await api("/api/memories", {
          method: "POST",
          body: JSON.stringify({ title: title || undefined, content: content })
        });
        document.getElementById("memoryTitle").value = "";
        document.getElementById("memoryContent").value = "";
        showToast("Memória salva.");
        loadMemories();
      });

      document.getElementById("memoryList").addEventListener("click", async function(event) {
        const button = event.target.closest("[data-delete-memory]");
        if (!button) return;
        await api("/api/memories/" + button.dataset.deleteMemory, { method: "DELETE" });
        showToast("Memória removida.");
        loadMemories();
      });

      document.getElementById("settingsForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        const displayName = document.getElementById("displayName").value.trim();
        const aiStyle = document.getElementById("aiStyle").value;
        const data = await api("/api/settings", {
          method: "PATCH",
          body: JSON.stringify({ displayName: displayName, aiStyle: aiStyle, theme: "dark" })
        });
        if (currentUser && data.settings.display_name) {
          currentUser.name = data.settings.display_name;
          els.accountName.textContent = data.settings.display_name;
          setView("settings");
        }
        showToast("Preferências salvas.");
      });

      document.getElementById("logoutButton").addEventListener("click", function() {
        localStorage.removeItem("yaraToken");
        localStorage.removeItem("yaraUser");
        window.location.href = "/";
      });

      init();
    </script>
  </body>
</html>`;
}

function navButton(view: string, label: string, iconName: IconName, active = false) {
  return `<button class="nav-button ${active ? "active" : ""}" data-view="${view}" type="button">${icon(iconName)}${label}</button>`;
}

function miniCard(iconName: IconName, title: string, description: string) {
  return `<article class="card"><span class="icon-box">${icon(iconName)}</span><h2>${title}</h2><p>${description}</p></article>`;
}

type IconName =
  | "brain"
  | "chat"
  | "code"
  | "folder"
  | "logout"
  | "menu"
  | "plus"
  | "save"
  | "send"
  | "settings"
  | "shield"
  | "sparkles"
  | "trash";

function icon(name: IconName) {
  const icons: Record<IconName, string> = {
    brain: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 4.5A3 3 0 0 0 6 7.5v.2A3.4 3.4 0 0 0 4 11a3.4 3.4 0 0 0 2 3.1v.4A3 3 0 0 0 9 17.5h1V4.5H9Zm6 0a3 3 0 0 1 3 3v.2A3.4 3.4 0 0 1 20 11a3.4 3.4 0 0 1-2 3.1v.4a3 3 0 0 1-3 3h-1V4.5h1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 9h2m4 0h2M8 13h2m4 0h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v4A3.5 3.5 0 0 1 15.5 14H11l-4.5 4v-4A3.5 3.5 0 0 1 3 10.5v-4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 8-4 4 4 4m8-8 4 4-4 4m-2.5-10-3 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 18 18H6a2.5 2.5 0 0 1-2.5-2.5v-8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 6H6.5A2.5 2.5 0 0 0 4 8.5v7A2.5 2.5 0 0 0 6.5 18H10m4-3 3-3-3-3m3 3H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h11l3 3v13H5V4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 4v6h8M8 20v-6h8v6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 12 16-8-5 16-3-6-8-2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m12 14 8-10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" stroke-width="1.8"/><path d="M19 13.3v-2.6l-2-.7a5.7 5.7 0 0 0-.7-1.6l.9-1.9-1.8-1.8-1.9.9a5.7 5.7 0 0 0-1.6-.7L11.3 3H8.7L8 5a5.7 5.7 0 0 0-1.6.7l-1.9-.9-1.8 1.8.9 1.9A5.7 5.7 0 0 0 3 10.1l-2 .6v2.6l2 .7c.2.6.4 1.1.7 1.6l-.9 1.9 1.8 1.8 1.9-.9c.5.3 1 .5 1.6.7l.6 2h2.6l.7-2c.6-.2 1.1-.4 1.6-.7l1.9.9 1.8-1.8-.9-1.9c.3-.5.5-1 .7-1.6l1.9-.7Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 5 6v5c0 4.5 2.8 8.4 7 10 4.2-1.6 7-5.5 7-10V6l-7-3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m9 12 2 2 4-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Zm6 10 .8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8L18 13ZM6 14l.8 2.2L9 17l-2.2.8L6 20l-.8-2.2L3 17l2.2-.8L6 14Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h14M9 7V5h6v2m-8 0 1 13h8l1-13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  return icons[name];
}
