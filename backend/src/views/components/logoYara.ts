type LogoYaraVariant = "complete" | "compact" | "icon";

type LogoYaraOptions = {
  variant?: LogoYaraVariant;
  className?: string;
  tagline?: string;
};

export function logoYaraStyles() {
  return `
      .logo-yara {
        --logo-size: 46px;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        color: #ffffff;
        text-decoration: none;
      }

      .logo-yara--hero {
        --logo-size: clamp(118px, 18vw, 188px);
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .logo-yara--auth {
        --logo-size: 72px;
        display: flex;
        justify-content: center;
        clear: both;
        margin-bottom: 18px;
      }

      .logo-yara--topbar {
        --logo-size: 42px;
      }

      .logo-yara__symbol {
        position: relative;
        width: var(--logo-size);
        height: var(--logo-size);
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.54);
        border-radius: 16px;
        background:
          radial-gradient(circle at 50% 22%, rgba(56, 189, 248, 0.34), transparent 48%),
          linear-gradient(145deg, rgba(10, 132, 255, 0.2), rgba(15, 23, 42, 0.92));
        box-shadow: 0 0 34px rgba(56, 189, 248, 0.24), inset 0 0 24px rgba(56, 189, 248, 0.1);
      }

      .logo-yara--hero .logo-yara__symbol {
        border-radius: 999px;
        box-shadow: 0 0 70px rgba(56, 189, 248, 0.34), inset 0 0 28px rgba(56, 189, 248, 0.12);
      }

      .logo-yara__image {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .logo-yara__fallback {
        position: absolute;
        inset: 0;
        display: none;
        place-items: center;
        color: #e0f2fe;
        font-size: calc(var(--logo-size) * 0.34);
        font-weight: 900;
        letter-spacing: 0;
        text-shadow: 0 0 16px rgba(56, 189, 248, 0.48);
      }

      .logo-yara--compact .logo-yara__image,
      .logo-yara--compact .logo-yara__fallback {
        display: none;
      }

      .logo-yara--compact .logo-yara__symbol::after {
        content: "YA";
        color: #e0f2fe;
        font-size: 16px;
        font-weight: 900;
      }

      .logo-yara__text {
        display: grid;
        gap: 3px;
        min-width: 0;
      }

      .logo-yara__name {
        display: block;
        color: #ffffff;
        font-size: 18px;
        font-weight: 800;
        line-height: 1;
      }

      .logo-yara__tagline {
        display: block;
        color: #94a3b8;
        font-size: 12px;
        font-weight: 600;
        line-height: 1.25;
      }

      .logo-yara--hero .logo-yara__name {
        font-size: clamp(40px, 7vw, 74px);
        text-shadow: 0 0 30px rgba(56, 189, 248, 0.36);
      }

      .logo-yara--hero .logo-yara__tagline {
        color: #bae6fd;
        font-size: clamp(16px, 2vw, 22px);
      }

      .logo-yara--icon .logo-yara__text,
      .logo-yara--compact .logo-yara__text {
        display: none;
      }
`;
}

export function renderLogoYara(options: LogoYaraOptions = {}) {
  const variant = options.variant ?? "complete";
  const className = options.className ? ` ${options.className}` : "";
  const tagline = options.tagline ?? "Sua inteligência. Sem limites.";

  return `<span class="logo-yara logo-yara--${variant}${className}">
    <span class="logo-yara__symbol" aria-hidden="true">
      <img class="logo-yara__image" src="/assets/yara-logo.png" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';" />
      <span class="logo-yara__fallback">YA</span>
    </span>
    <span class="logo-yara__text">
      <span class="logo-yara__name">YARA AI</span>
      <span class="logo-yara__tagline">${tagline}</span>
    </span>
  </span>`;
}
