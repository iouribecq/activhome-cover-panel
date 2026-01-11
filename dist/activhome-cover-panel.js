// Activhome Cover Panel - v0.1.4 (no-build, dependency-free)
// Type: custom:activhome-cover-panel
//
// Features:
// - 1 row (50px): icon (dynamic SVG) + name (navigate/more-info) + open/stop/close actions
// - Optional theme applied to this card only
// - Optional style presets + card_style CSS injection (targets ha-card)
// - Keeps current Activhome icon approach: <img> with filter invert/brightness (no regressions)
//
// Config:
//   entity (required): cover.xxx
//   name (optional)
//   navigation_path (optional): /dashboard/0
//   tap_action (optional): HA native ui_action (we only use action=navigate + navigation_path)
//   theme (optional): HA theme name (applies theme vars to this card only)
//   style (optional): transparent|transparent_vertical_stack|activhome|glass|dark_glass|solid|neon_pulse|neon_glow|primary_breathe|primary_tint...
//   font_size (optional): "16px"..."24px" (default: 20px)
//   card_style (optional): CSS injected into card (targets ha-card)
//   cover_variant (optional): store|store_banne (default: store)
//
// Notes:
// - Uses cover.current_position (0..100) to pick store_XX.svg with your existing mapping.
// - Buttons call services: cover.open_cover / cover.stop_cover / cover.close_cover
// - store_banne: inversion VISUELLE uniquement (mapping icônes), aucune inversion des actions HA.

(() => {
  function fireEvent(node, type, detail = {}, options = {}) {
    const event = new CustomEvent(type, {
      bubbles: options.bubbles ?? true,
      composed: options.composed ?? true,
      cancelable: options.cancelable ?? false,
      detail,
    });
    node.dispatchEvent(event);
    return event;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // --- Optional Home Assistant theme support -------------------------------
  function _getThemeVars(hass, themeName) {
    const themes = hass?.themes?.themes;
    if (!themes || !themeName) return null;
    const theme = themes[themeName];
    if (!theme) return null;

    // Theme structure can be flat or { modes: { light: {...}, dark: {...} } }
    if (theme.modes && (theme.modes.light || theme.modes.dark)) {
      const modeKey = hass.themes?.darkMode ? "dark" : "light";
      return theme.modes[modeKey] || theme.modes.light || theme.modes.dark || null;
    }
    return theme;
  }

  function _clearTheme(el, prevVars) {
    if (!el || !prevVars) return;
    Object.keys(prevVars).forEach((k) => {
      const cssVar = k.startsWith("--") ? k : `--${k}`;
      el.style.removeProperty(cssVar);
    });
  }

  function _applyTheme(el, hass, themeName, prevVars) {
    const vars = _getThemeVars(hass, themeName);
    if (!vars) return null;

    _clearTheme(el, prevVars);

    Object.entries(vars).forEach(([key, val]) => {
      const cssVar = key.startsWith("--") ? key : `--${key}`;
      el.style.setProperty(cssVar, String(val));
    });
    return vars;
  }
  // -------------------------------------------------------------------------

  function stylePresetCss(styleName) {
    const s = (styleName || "transparent").toLowerCase();
    switch (s) {
      case "activhome":
        return `
          ha-card {
            --mdc-icon-size: 0px;
            --ha-card-padding: 10px;

            padding: var(--ha-card-padding) !important;

            background-color: rgba(0,0,0,0.40);
            border: 1px solid rgba(255,255,255,0.15);

            border-radius: 16px;
            box-shadow: none;
          }`;

      case "glass":
        return `
          ha-card{
            --mdc-icon-size: 0px;
            --ha-card-padding: 10px;

            padding: var(--ha-card-padding) !important;

            background: rgba(255,255,255,0.10);
            border-radius: 16px;
            box-shadow: none;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }`;

      case "dark_glass":
        return `
          ha-card{
            --mdc-icon-size: 0px;
            --ha-card-padding: 10px;

            padding: var(--ha-card-padding) !important;
            border-radius: 16px;
            background: rgba(15, 15, 15, 0.55);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.12);
          }`;

      case "solid":
        return `
          ha-card{
            --mdc-icon-size: 0px;
            --ha-card-padding: 10px;

            padding: var(--ha-card-padding) !important;

            background: var(--card-background-color, rgba(0,0,0,0.2));
            border-radius: 16px;
            box-shadow: none;
          }`;

      case "transparent_vertical_stack":
        return `
          ha-card{
            background: none;
            box-shadow: none;
          }`;

      case "neon_pulse":
        return `
          ha-card {
            border-radius: 16px;
            background: rgba(10, 10, 10, 0.45);
            padding: 8px 10px;

            backdrop-filter: blur(8px) brightness(1.1);
            -webkit-backdrop-filter: blur(8px) brightness(1.1);

            border: 1px solid rgba(255, 0, 180, 0.4);

            box-shadow:
              0 0 12px rgba(255, 0, 180, 0.5),
              0 0 24px rgba(255, 0, 180, 0.3),
              0 8px 20px rgba(0, 0, 0, 0.4);

            animation: ah_neon_pulse 12s linear infinite;
            transition:
              box-shadow 0.4s ease,
              border-color 0.4s ease,
              background 0.4s ease;

            will-change: box-shadow, border-color;
          }

          @keyframes ah_neon_pulse {
            0% {
              border-color: rgba(255, 0, 180, 0.5);
              box-shadow:
                0 0 12px rgba(255, 0, 180, 0.6),
                0 0 24px rgba(255, 0, 180, 0.35),
                0 8px 20px rgba(0, 0, 0, 0.4);
            }
            25% {
              border-color: rgba(0, 180, 255, 0.5);
              box-shadow:
                0 0 12px rgba(0, 180, 255, 0.6),
                0 0 24px rgba(0, 180, 255, 0.35),
                0 8px 20px rgba(0, 0, 0, 0.4);
            }
            50% {
              border-color: rgba(0, 255, 120, 0.5);
              box-shadow:
                0 0 12px rgba(0, 255, 120, 0.6),
                0 0 24px rgba(0, 255, 120, 0.35),
                0 8px 20px rgba(0, 0, 0, 0.4);
            }
            75% {
              border-color: rgba(255, 140, 0, 0.5);
              box-shadow:
                0 0 12px rgba(255, 140, 0, 0.6),
                0 0 24px rgba(255, 140, 0, 0.35),
                0 8px 20px rgba(0, 0, 0, 0.4);
            }
            100% {
              border-color: rgba(255, 0, 180, 0.5);
              box-shadow:
                0 0 12px rgba(255, 0, 180, 0.6),
                0 0 24px rgba(255, 0, 180, 0.35),
                0 8px 20px rgba(0, 0, 0, 0.4);
            }
          }`;

      case "neon_glow":
        return `
          ha-card{
            --ah-accent: var(--ah-accent-color, var(--primary-color, #00ffff));

            border-radius: 16px;
            background: rgba(10, 10, 10, 0.45);
            padding: 8px 10px;

            backdrop-filter: blur(6px) brightness(1.1);
            -webkit-backdrop-filter: blur(6px) brightness(1.1);

            border: 1px solid color-mix(in oklab, var(--ah-accent) 55%, transparent);

            box-shadow:
              0 0 10px color-mix(in oklab, var(--ah-accent) 55%, transparent),
              0 0 20px color-mix(in oklab, var(--ah-accent) 35%, transparent),
              0 8px 20px rgba(0, 0, 0, 0.4);

            transition: box-shadow 0.3s ease;
          }

          ha-card:hover{
            box-shadow:
              0 0 14px color-mix(in oklab, var(--ah-accent) 70%, transparent),
              0 0 26px color-mix(in oklab, var(--ah-accent) 45%, transparent),
              0 10px 24px rgba(0, 0, 0, 0.45);
          }`;

      case "primary_breathe":
        return `
          ha-card{
            --ah-accent: var(--ah-accent-color, var(--primary-color));

            border-radius: 16px;

            background: linear-gradient(
              120deg,
              color-mix(in oklab, var(--ah-accent) 20%, rgba(12,12,12,0.55)),
              rgba(12,12,12,0.55)
            );

            padding: 8px 10px;

            backdrop-filter: blur(8px) saturate(115%);
            -webkit-backdrop-filter: blur(8px) saturate(115%);

            border: 1px solid color-mix(in oklab, var(--ah-accent) 60%, transparent);

            box-shadow:
              0 0 10px color-mix(in oklab, var(--ah-accent) 40%, transparent),
              0 8px 20px rgba(0, 0, 0, 0.40);

            transition: box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;

            animation: ah_breathe 5.5s ease-in-out infinite;
            will-change: transform, box-shadow;
            transform: translateZ(0);
          }

          @keyframes ah_breathe {
            0% {
              box-shadow:
                0 0 10px color-mix(in oklab, var(--ah-accent) 40%, transparent),
                0 8px 20px rgba(0, 0, 0, 0.40);
              transform: translateZ(0) scale(1.00);
            }
            50% {
              box-shadow:
                0 0 18px color-mix(in oklab, var(--ah-accent) 65%, transparent),
                0 10px 24px rgba(0, 0, 0, 0.42);
              transform: translateZ(0) scale(1.01);
            }
            100% {
              box-shadow:
                0 0 10px color-mix(in oklab, var(--ah-accent) 40%, transparent),
                0 8px 20px rgba(0, 0, 0, 0.40);
              transform: translateZ(0) scale(1.00);
            }
          }`;

      case "primary_tint":
        return `
          ha-card{
            --ah-accent: var(--ah-accent-color, var(--primary-color));

            border-radius: 16px;

            background: linear-gradient(
              120deg,
              color-mix(in oklab, var(--ah-accent) 18%, rgba(12,12,12,0.55)),
              rgba(12,12,12,0.55)
            );

            padding: 8px 10px;

            backdrop-filter: blur(8px) saturate(115%);
            -webkit-backdrop-filter: blur(8px) saturate(115%);

            border: 1px solid color-mix(in oklab, var(--ah-accent) 65%, transparent);

            box-shadow:
              0 0 12px color-mix(in oklab, var(--ah-accent) 45%, transparent),
              0 8px 20px rgba(0, 0, 0, 0.40);

            transition:
              box-shadow 0.25s ease,
              border-color 0.25s ease,
              background 0.25s ease;
          }

          ha-card:hover{
            box-shadow:
              0 0 16px color-mix(in oklab, var(--ah-accent) 60%, transparent),
              0 10px 24px rgba(0, 0, 0, 0.42);

            border-color: color-mix(in oklab, var(--ah-accent) 80%, transparent);
          }`;

      case "transparent":
      default:
        return `
          ha-card{
            --mdc-icon-size: 0px;
            --ha-card-padding: 10px;

            padding: var(--ha-card-padding) !important;

            background: none;
            box-shadow: none;
          }`;
    }
  }

  function clampInt(n, min, max, fallback) {
    const x = Number(n);
    if (!Number.isFinite(x)) return fallback;
    return Math.min(max, Math.max(min, Math.round(x)));
  }

  // Your mapping logic (extended)
  // cover_variant:
  // - "store" (default): existing mapping unchanged
  // - "store_banne": inverted VISUAL mapping only (no HA logic change)
  function getStoreIconFileFromPosition(pos, coverVariant = "store") {
    const p = clampInt(pos ?? 0, 0, 100, 0);
    const isBanne = (String(coverVariant || "store").toLowerCase() === "store_banne");

    // store: p==0 => icon 100 (fully closed) [existing behavior]
    // store_banne: p==0 => icon 0 (visually "open/deployed" for your icon set)
    if (p === 0) return isBanne ? 0 : 100;

    const step = Math.floor((p - 1) / 10) * 10;

    // store: existing behavior
    // store_banne: inverted mapping
    const file = isBanne ? (step + 10) : (100 - (step + 10));

    return clampInt(file, 0, 100, 100);
  }

  function getBanneEtat(stateObj) {
    const st = String(stateObj?.state ?? "unknown").toLowerCase();
    if (st === "open" || st === "opening") return "Ouvert";
    if (st === "closed" || st === "closing") return "Fermé";
    return "";
  }

  class ActivhomeCoverPanel extends HTMLElement {
    set hass(hass) {
      this._hass = hass;
      this._render();
    }

    setConfig(config) {
      if (!config || !config.entity) {
        throw new Error("activhome-cover-panel: 'entity' is required");
      }
      const style = config.style ?? config.variant ?? "transparent";

      // Default cover_variant: store
      // (Do NOT write it back into YAML unless user explicitly chooses store_banne)
      const raw = String(config.cover_variant || "store").toLowerCase();
      const cv = (raw === "store_banne") ? "store_banne" : "store";

      this._config = { ...config, style, cover_variant: cv };
      this._render();
    }

    getCardSize() {
      return 1;
    }

    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      this._render();
    }


_applyResponsiveActions() {
  // “Native-like”: keep text size, adapt ONLY the action controls when width is tight.
  const w = this.getBoundingClientRect().width || 0;

  let actionW = 60;
  let gap = 6;
  let icon = 32;

  // iPad 3 columns / medium widths
  if (w < 520) {
    actionW = 52;
    gap = 5;
    icon = 28;
  }

  // iPhone / very narrow widths
  if (w < 420) {
    actionW = 44; // keep a decent tap target
    gap = 4;
    icon = 24;
  }

  this.style.setProperty("--ah-action-w", `${actionW}px`);
  this.style.setProperty("--ah-action-gap", `${gap}px`);
  this.style.setProperty("--ah-action-icon", `${icon}px`);
}

_ensureResponsiveObserver() {
  if (this._roActions) return;
  this._roActions = new ResizeObserver(() => this._applyResponsiveActions());
  this._roActions.observe(this);
}

disconnectedCallback() {
  if (this._roActions) {
    try { this._roActions.disconnect(); } catch (_) {}
    this._roActions = null;
  }
}

    _stateObj() {
      return this._hass?.states?.[this._config?.entity];
    }

    _openMoreInfo(entityId) {
      fireEvent(this, "hass-more-info", { entityId });
    }

    _navigate(path) {
      if (!path) return;
      history.pushState(null, "", path);
      window.dispatchEvent(new Event("location-changed"));
    }

    _callCoverService(service) {
      const entityId = this._config?.entity;
      if (!entityId) return;
      this._hass?.callService("cover", service, { entity_id: entityId });
    }

    _render() {
      if (!this.shadowRoot || !this._config) return;

      const hass = this._hass;
      const stateObj = hass && this._stateObj();

      const baseName =
        this._config.name ||
        (stateObj && (stateObj.attributes.friendly_name || "")) ||
        this._config.entity;

      const isBanne = this._config.cover_variant === "store_banne";

      let iconSrc = "";
      let displayName = baseName;

      if (isBanne) {
        // Same icon for open/closed (legacy Activhome store banne look)
        iconSrc = `/local/community/activhome-icons/dist/icons/storebanne-unique.svg?v=1`;

        const etat = getBanneEtat(stateObj);
        if (etat) displayName = `${baseName} ${etat}`; // no dash
      } else {
        const pos = stateObj?.attributes?.current_position ?? 0;

        // existing mapping for store (and any non-banne)
        const file = getStoreIconFileFromPosition(pos, this._config.cover_variant);

        iconSrc = `/local/community/activhome-icons/dist/icons/store_${file}.svg?v=1`;
      }

      const presetCss = stylePresetCss(this._config.style);
      const customCss = this._config.card_style ? `\n/* card_style */\n${this._config.card_style}\n` : "";

      this.shadowRoot.innerHTML = `
        <style>
          :host { display:block; --ah-action-w: 60px; --ah-action-gap: 6px; --ah-action-icon: 32px; }

          ha-card{
            padding: 0;
            --ha-card-border-width: 0px;
            color: var(--primary-text-color);
          }
          ${presetCss}
          ${customCss}

          .row{
            display:grid;
            grid-template-columns: 48px 1fr var(--ah-action-w) var(--ah-action-w) var(--ah-action-w);
            align-items:center;
            column-gap:var(--ah-action-gap);
            height:50px;
          }

          button{ font: inherit; }

          .iconBtn{
            height:50px; width:48px;
            display:flex; align-items:center; justify-content:center;
            background:none; border:none; padding:0;
            cursor:pointer;
          }

          .iconImg{
            width: 44px;
            height: 44px;
            object-fit: contain;
            display: block;
            filter: invert(1) brightness(2);
          }

          /* Store banne: enlarge icon (legacy look) */
          .iconImg.banne{ width: 100% !important; height: 100% !important; }

          .nameBtn{
            height:50px;
            background:none; border:none;
            padding:0 0 0 4px;
            text-align:left;
            min-width:0;
            display:flex; align-items:center;
            cursor:pointer;
          }

          .name{
            font-size: var(
              --ah-font-size,
              var(
                --ha-font-size-m,
                var(--paper-font-body1_-_font-size, 20px)
              )
            );
            font-weight: var(
              --ha-font-weight-normal,
              var(--paper-font-body1_-_font-weight, 500)
            );
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
            width:100%;
            color: var(--primary-text-color);
          }

          .actionBtn{
            height:50px; width:var(--ah-action-w);
            display:flex; align-items:center; justify-content:center;
            background:none; border:none; padding:0;
            cursor:pointer;
            border-radius:10px;
            transition: background-color 120ms ease;
            color: var(--primary-text-color);
          }
          .actionBtn:hover{ background: color-mix(in oklab, currentColor 12%, transparent); }
          .actionBtn:active{ background: color-mix(in oklab, currentColor 18%, transparent); }
          
          /* ✅ iOS/tactile : feedback au tap conservé, sans effet stroboscope */
          @media (hover: none) and (pointer: coarse) {
            .actionBtn,
            .iconBtn,
            .nameBtn {
              transition: none !important; /* supprime la source du flash iOS */
            }
            
            /* iOS : empêche le hover "collé" après tap */
            .actionBtn:hover,
            .iconBtn:hover,
            .nameBtn:hover {
              background: none !important;
            }
        
          /* Feedback "pressed" stable (pas de color-mix) */
            .actionBtn:active,
            .iconBtn:active,
            .nameBtn:active {
              background: rgba(255, 255, 255, 0.10) !important;
            }
          }

          ha-icon{ --mdc-icon-size: var(--ah-action-icon); color: currentColor; }
        </style>

        <ha-card>
          <div class="row">
            <button class="iconBtn" id="iconBtn" aria-label="More info">
              <img class="iconImg ${isBanne ? "banne" : ""}" alt="" src="${escapeHtml(iconSrc)}">
            </button>

            <button class="nameBtn" id="nameBtn" aria-label="Navigate or more-info">
              <span class="name">${escapeHtml(displayName)}</span>
            </button>

            <button class="actionBtn" id="openBtn" aria-label="Open">
              <ha-icon icon="mdi:arrow-up"></ha-icon>
            </button>

            <button class="actionBtn" id="stopBtn" aria-label="Stop">
              <ha-icon icon="mdi:stop"></ha-icon>
            </button>

            <button class="actionBtn" id="closeBtn" aria-label="Close">
              <ha-icon icon="mdi:arrow-down"></ha-icon>
            </button>
          </div>
        </ha-card>
      `;

      // Responsive action controls (native-like)
      this._ensureResponsiveObserver();
      this._applyResponsiveActions();

      const cardEl = this.shadowRoot.querySelector("ha-card");

      // Apply optional HA theme (no effect when theme is unset)
      const themeName = (this._config.theme || "").trim();
      if (cardEl) {
        if (themeName) {
          this._appliedThemeVars = _applyTheme(cardEl, hass, themeName, this._appliedThemeVars);
        } else if (this._appliedThemeVars) {
          _clearTheme(cardEl, this._appliedThemeVars);
          this._appliedThemeVars = null;
        }

        // Font size: default is 20px (even if HA defines --ha-font-size-m)
        const fs = (this._config.font_size || "").trim();
        cardEl.style.setProperty("--ah-font-size", fs || "20px");
      }

      // Click handlers
      this.shadowRoot.getElementById("iconBtn")?.addEventListener("click", () => {
        this._openMoreInfo(this._config.entity);
      });

      this.shadowRoot.getElementById("nameBtn")?.addEventListener("click", () => {
        // ✅ Optional HA native action (we only support navigate here)
        const ta = this._config.tap_action;
        if (ta && typeof ta === "object") {
          const a = String(ta.action || "").toLowerCase();
          if (a === "navigate") {
            const p = String(ta.navigation_path || "").trim();
            if (p) {
              this._navigate(p);
              return;
            }
          }
        }

        // ✅ Backward-compatible behavior (unchanged)
        const path = (this._config.navigation_path || "").trim();
        if (path) this._navigate(path);
        else this._openMoreInfo(this._config.entity);
      });

      this.shadowRoot.getElementById("openBtn")?.addEventListener("click", () => {
        this._callCoverService("open_cover");
      });

      this.shadowRoot.getElementById("stopBtn")?.addEventListener("click", () => {
        this._callCoverService("stop_cover");
      });

      this.shadowRoot.getElementById("closeBtn")?.addEventListener("click", () => {
        this._callCoverService("close_cover");
      });
    }

    static getConfigElement() {
      return document.createElement("activhome-cover-panel-editor");
    }

    static getStubConfig() {
      return {
        type: "custom:activhome-cover-panel",
        entity: "cover.example",
        navigation_path: "",
        theme: "",
        style: "transparent",
        font_size: "",
        card_style: "",
        // cover_variant intentionally omitted (default = store)
      };
    }
  }

  class ActivhomeCoverPanelEditor extends HTMLElement {
    set hass(hass) {
      this._hass = hass;
      if (this._form) this._form.hass = hass;

      // Refresh theme list in dropdown when HA themes become available/updated
      if (this._schema) {
        const themeNames = Object.keys(this._hass?.themes?.themes || {}).sort((a, b) => a.localeCompare(b));
        const themeField = this._schema.find((f) => f.name === "theme");
        if (themeField && themeField.selector?.select) {
          themeField.selector.select.options = [{ label: "Aucun", value: "" }].concat(
            themeNames.map((t) => ({ label: t, value: t }))
          );
        }
        if (this._form) this._form.schema = this._schema;
      }
    }

    setConfig(config) {
      const style = config.style ?? config.variant ?? "transparent";
      this._config = { ...config, style };
      this._ensureRendered();
      this._setFormDataFromConfig();
    }

    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      this._ensureRendered();
      this._setFormDataFromConfig();
    }

    _ensureRendered() {
      if (this._rendered) return;
      this._rendered = true;

      this.shadowRoot.innerHTML = `
        <style>
          .hint { opacity:0.8; font-size: 12px; line-height: 1.3; margin-top: 6px; }
          .wrap { display: grid; gap: 10px; }
          code { font-family: var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, monospace); }
        </style>
        <div class="wrap">
          <ha-form id="form"></ha-form>
          <div class="hint">
            <div><b>CSS avancé</b> : le contenu de <code>card_style</code> est injecté tel quel dans la carte.</div>
            <div>Pour modifier le fond/radius/ombre, cible <code>ha-card { ... }</code>.</div>
          </div>
        </div>
      `;

      this._form = this.shadowRoot.getElementById("form");
      if (this._hass) this._form.hass = this._hass;

      this._schema = [
        { name: "entity", label: "Volet / store (cover)", required: true, selector: { entity: { domain: "cover" } } },

        // ✅ NEW (minimal): cover variant (store vs store banne)
        {
          name: "cover_variant",
          label: "Type de store",
          selector: {
            select: {
              options: [
                { label: "Store (classique)", value: "store" },
                { label: "Store banne", value: "store_banne" },
              ],
              mode: "dropdown",
            },
          },
        },

        { name: "name", label: "Nom affiché (optionnel)", selector: { text: {} } },
        { name: "navigation_path", label: "Navigation path (optionnel)", selector: { text: {} } },
        { name: "tap_action", label: "Navigation (UI native, optionnel)", selector: { ui_action: {} } },
        {
          name: "theme",
          label: "Theme (optionnel)",
          selector: {
            select: {
              options: [{ label: "Aucun", value: "" }],
              mode: "dropdown",
            },
          },
        },
        {
          name: "style",
          label: "Style",
          selector: {
            select: {
              options: [
                { label: "Transparent", value: "transparent" },
                { label: "Transparent Vertical Stack", value: "transparent_vertical_stack" },
                { label: "Activhome", value: "activhome" },
                { label: "Glass", value: "glass" },
                { label: "Dark glass (Activhome)", value: "dark_glass" },
                { label: "Solid", value: "solid" },
                { label: "Neon Pulse", value: "neon_pulse" },
                { label: "Neon Glow", value: "neon_glow" },
                { label: "Primary + Breathe", value: "primary_breathe" },
                { label: "Primary Tint", value: "primary_tint" },
              ],
              mode: "dropdown",
            },
          },
        },
        {
          name: "font_size",
          label: "Taille police (optionnel)",
          selector: {
            select: {
              options: [
                { label: "Par défaut (20)", value: "" },
                { label: "16", value: "16px" },
                { label: "17", value: "17px" },
                { label: "18", value: "18px" },
                { label: "19", value: "19px" },
                { label: "20", value: "20px" },
                { label: "21", value: "21px" },
                { label: "22", value: "22px" },
                { label: "23", value: "23px" },
                { label: "24", value: "24px" },
              ],
              mode: "dropdown",
            },
          },
        },
        { name: "card_style", label: "CSS avancé (optionnel)", selector: { text: { multiline: true } } },
      ];

      // Populate theme dropdown from HA themes
      const themeNames = Object.keys(this._hass?.themes?.themes || {}).sort((a, b) => a.localeCompare(b));
      const themeField = this._schema.find((f) => f.name === "theme");
      if (themeField && themeField.selector?.select) {
        themeField.selector.select.options = [{ label: "Aucun", value: "" }].concat(
          themeNames.map((t) => ({ label: t, value: t }))
        );
      }

      this._form.schema = this._schema;

      this._form.addEventListener("value-changed", (ev) => {
        const v = ev.detail?.value || {};
        const merged = { ...this._config, ...v, type: "custom:activhome-cover-panel" };

        // Clean empties (keep YAML clean)
        ["name", "navigation_path", "tap_action", "card_style", "theme", "font_size", "cover_variant"].forEach((k) => {
          if (merged[k] === "" || merged[k] == null) delete merged[k];
        });

        if (!merged.style) merged.style = "transparent";

        // Keep YAML clean: store is default => omit cover_variant
        if ((merged.cover_variant || "store") === "store") delete merged.cover_variant;

        this._config = merged;
        fireEvent(this, "config-changed", { config: merged });
      });
    }

    _setFormDataFromConfig() {
      if (!this._form || !this._config) return;
      const data = {
        entity: this._config.entity || "",
        // default shown in UI even if YAML omits it
        cover_variant: this._config.cover_variant || "store",
        name: this._config.name || "",
        navigation_path: this._config.navigation_path || "",
        tap_action: this._config.tap_action || undefined,
        theme: this._config.theme || "",
        style: this._config.style || "transparent",
        font_size: this._config.font_size || "",
        card_style: this._config.card_style || "",
      };
      this._form.data = data;
    }
  }

  if (!customElements.get("activhome-cover-panel")) {
    customElements.define("activhome-cover-panel", ActivhomeCoverPanel);
  }
  if (!customElements.get("activhome-cover-panel-editor")) {
    customElements.define("activhome-cover-panel-editor", ActivhomeCoverPanelEditor);
  }

  window.customCards = window.customCards || [];
  if (!window.customCards.find((c) => c.type === "activhome-cover-panel")) {
    window.customCards.push({
      type: "activhome-cover-panel",
      name: "Activhome Cover Panel",
      description: "Panneau de contrôle d’un volet/store (icône SVG dynamique + nom + ouvrir/stop/fermer)",
    });
  }
})();
