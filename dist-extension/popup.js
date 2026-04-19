const state = {
  mode: "DESIGN",
  profile: "claude",
  data: null,
};

const elements = {
  tabs: [...document.querySelectorAll("[data-mode]")],
  profiles: [...document.querySelectorAll("[data-profile]")],
  sourceTitle: document.getElementById("sourceTitle"),
  sourceUrl: document.getElementById("sourceUrl"),
  statusPill: document.getElementById("statusPill"),
  errorCard: document.getElementById("errorCard"),
  outputPanel: document.getElementById("outputPanel"),
  copyButton: document.getElementById("copyButton"),
  refreshButton: document.getElementById("refreshButton"),
};

const formatList = (items) => (items.length ? items.join(", ") : "Not detected");

const profileMeta = {
  claude: {
    name: "Claude Code",
    focus: "long-form guidelines, explicit rules, and structured handoff",
  },
  codex: {
    name: "Codex",
    focus: "implementation-ready markdown with concise engineering direction",
  },
  cursor: {
    name: "Cursor",
    focus: "fast builder-oriented output with strong layout and component cues",
  },
  stitch: {
    name: "Stitch",
    focus: "UI generation oriented structure with visual and content system hints",
  },
};

const getPrompt = (data, mode, profile) => {
  if (!data) {
    return "Extract a site to generate a clean DESIGN.md or SKILL.md.";
  }

  const profileInfo = profileMeta[profile];

  if (mode === "DESIGN") {
    return `# DESIGN.md
## AI Profile
- Target: ${profileInfo.name}
- Preferred shape: ${profileInfo.focus}

## Source
- ${data.title}
- ${data.url}

## Product Summary
- Brand or page: ${data.title}
- Tone: ${formatList(data.tone)}
- Intent: ${formatList(data.intent)}
- Audience: ${formatList(data.audience)}

## Direction
- Clean, modern, production-ready
- Keep the source tone
- Simplify hierarchy and spacing

## Core Tokens
### Colors
- ${formatList(data.colors)}

### Typography
- ${formatList(data.fonts)}

### Border Radius
- ${formatList(data.radius)}

### Spacing Rhythm
- ${formatList(data.spacing)}

## UI Patterns
### Buttons
- ${formatList(data.buttons)}

### Surfaces
- ${formatList(data.surfaces)}

### Shadows
- ${formatList(data.shadows)}

### Borders
- ${formatList(data.borders)}

## Structure
### Layout
- ${formatList(data.layout)}

### Components
- ${formatList(data.components)}

### Content
- ${formatList(data.content)}

### Navigation
- ${formatList(data.navigation)}

### Forms
- ${formatList(data.forms)}

## Typography System
### Headings
- ${formatList(data.headings)}

### Text Sizes
- ${formatList(data.textSizes)}

## Visual Behavior
### Alignment
- ${formatList(data.alignment)}

### Density
- ${formatList(data.density)}

### Emphasis
- ${formatList(data.emphasis)}

## Guideline Authoring Workflow
- Review the extracted product summary and confirm the primary user goal
- Convert recurring UI patterns into reusable guidance instead of one-off notes
- Map visual tokens to components, layout rules, and writing expectations
- Use the quality gates below before publishing the final guideline

## Rules: Do
- Preserve the dominant hierarchy and spacing rhythm
- Reuse repeated patterns for buttons, cards, navigation, and forms
- Keep language short, specific, and implementation-friendly
- Prefer clear sections, consistent labels, and predictable interaction states

## Rules: Don't
- Do not copy isolated CSS values without explaining their role in the system
- Do not over-style secondary actions or compete with the primary CTA
- Do not mix multiple visual directions in the same interface
- Do not write vague guidance that cannot be checked or implemented

## Accessibility
- Maintain strong contrast between text, surfaces, and interactive controls
- Keep heading structure clear and preserve readable text sizing
- Ensure buttons, links, and form controls remain visually distinct
- Avoid relying only on color to communicate state or importance

## Writing Tone
- Write with a ${formatList(data.tone)} tone when supported by the page
- Keep product copy concise, direct, and easy to scan
- Prefer action-oriented labels over decorative language
- Match the maturity of the source product without copying its wording

## Quality Gates
- The guideline should describe colors, type, spacing, surfaces, and components
- The guideline should explain layout behavior, navigation, and form treatment
- The guideline should be actionable enough for design or implementation handoff
- The guideline should feel consistent with the detected audience and intent
- The final structure should be optimized for ${profileInfo.name}

## Implementation Notes
- Preserve structure before matching exact decoration
- Reuse repeated blocks as a small design system
- Keep the primary action visually dominant
- Use spacing and type scale to drive clarity

## Rules
- Strong primary action
- Calm secondary UI
- Prioritize scanability`;
  }

  return `# SKILL.md
## AI Profile
- Target: ${profileInfo.name}
- Preferred shape: ${profileInfo.focus}

## Purpose
- Extract a site's visual system
- Turn it into reusable design guidance

## Input
- URL: ${data.url}
- Title: ${data.title}
- Colors: ${formatList(data.colors)}
- Fonts: ${formatList(data.fonts)}
- Radius: ${formatList(data.radius)}
- Spacing: ${formatList(data.spacing)}
- Buttons: ${formatList(data.buttons)}
- Surfaces: ${formatList(data.surfaces)}
- Shadows: ${formatList(data.shadows)}
- Borders: ${formatList(data.borders)}
- Layout: ${formatList(data.layout)}
- Components: ${formatList(data.components)}
- Content: ${formatList(data.content)}
- Navigation: ${formatList(data.navigation)}
- Forms: ${formatList(data.forms)}
- Headings: ${formatList(data.headings)}
- Text sizes: ${formatList(data.textSizes)}
- Tone: ${formatList(data.tone)}
- Intent: ${formatList(data.intent)}
- Audience: ${formatList(data.audience)}
- Alignment: ${formatList(data.alignment)}
- Density: ${formatList(data.density)}
- Emphasis: ${formatList(data.emphasis)}

## Behavior
- Inspect the current page
- Capture core visual tokens
- Detect common UI patterns and structure
- Output concise markdown

## Output Requirements
- Describe palette, type, shape, and spacing
- Include surfaces, buttons, borders, shadows, layout, and content patterns
- Include guideline workflow, do/don't rules, accessibility, writing tone, and quality gates
- Optimize the final structure for ${profileInfo.name}
- Capture tone, not only CSS
- Keep it structured and actionable`;
};

const setError = (message) => {
  if (!message) {
    elements.errorCard.hidden = true;
    elements.errorCard.textContent = "";
    return;
  }

  elements.errorCard.hidden = false;
  elements.errorCard.textContent = message;
};

const render = () => {
  const { data, mode, profile } = state;

  for (const tab of elements.tabs) {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", String(active));
  }

  for (const item of elements.profiles) {
    const active = item.dataset.profile === profile;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-pressed", String(active));
  }

  elements.outputPanel.textContent = getPrompt(data, mode, profile);
  elements.sourceTitle.textContent = data?.title ?? "No site extracted yet";
  elements.sourceUrl.textContent = data?.url ?? "Open any website and run extraction";
  elements.statusPill.hidden = !data;
};

const extractFromActiveTab = async () => {
  elements.refreshButton.disabled = true;
  elements.refreshButton.textContent = "Running";
  setError("");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      throw new Error("No active tab found.");
    }

    const tabUrl = tab.url ?? "";
    const blockedProtocols = ["chrome://", "chrome-extension://", "edge://", "about:"];

    if (blockedProtocols.some((protocol) => tabUrl.startsWith(protocol))) {
      throw new Error("Open a normal website tab and try again.");
    }

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const pickTop = (values, limit = 8) => {
          const counts = new Map();

          values.forEach((value) => {
            if (!value) return;
            const normalized = value.trim();
            if (!normalized) return;
            counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
          });

          return [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([value]) => value);
        };

        const cleanText = (value) => value.replace(/\s+/g, " ").trim();
        const describeDisplay = (style) => {
          if (style.display === "grid") return `grid ${style.gridTemplateColumns || ""}`.trim();
          if (style.display === "flex") return `flex ${style.flexDirection || "row"} ${style.justifyContent}/${style.alignItems}`;
          return style.display;
        };

        const els = [...document.querySelectorAll("*")].slice(0, 1200);
        const colorSamples = [];
        const fontSamples = [];
        const radiusSamples = [];
        const spacingSamples = [];
        const buttonSamples = [];
        const surfaceSamples = [];
        const shadowSamples = [];
        const borderSamples = [];
        const layoutSamples = [];
        const componentSamples = [];
        const contentSamples = [];
        const navigationSamples = [];
        const formSamples = [];
        const headingSamples = [];
        const textSizeSamples = [];
        const toneSamples = [];
        const intentSamples = [];
        const audienceSamples = [];
        const alignmentSamples = [];
        const densitySamples = [];
        const emphasisSamples = [];

        els.forEach((el) => {
          const s = window.getComputedStyle(el);
          const text = cleanText(el.textContent || "");
          const color = s.color;
          const bg = s.backgroundColor;
          const borderRadius = s.borderRadius;
          const gap = s.gap;
          const padding = `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`;
          const margin = `${s.marginTop} ${s.marginRight} ${s.marginBottom} ${s.marginLeft}`;
          const border = `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`;
          const boxShadow = s.boxShadow;
          const tag = el.tagName.toLowerCase();
          const role = el.getAttribute("role") || "";
          const className = typeof el.className === "string" ? cleanText(el.className) : "";
          const aria = el.getAttribute("aria-label") || "";
          const textAlign = s.textAlign;
          const fontWeight = Number.parseInt(s.fontWeight, 10);
          const fontSize = s.fontSize;

          if (["button", "a"].includes(tag) || role === "button") {
            buttonSamples.push(
              [tag, bg !== "rgba(0, 0, 0, 0)" ? bg : "transparent", borderRadius, padding].filter(Boolean).join(" | ")
            );
          }

          if (bg && bg !== "rgba(0, 0, 0, 0)" && parseFloat(s.opacity || "1") > 0) {
            surfaceSamples.push([bg, borderRadius !== "0px" ? borderRadius : "", boxShadow !== "none" ? "shadow" : ""].filter(Boolean).join(" | "));
          }

          if (boxShadow && boxShadow !== "none") shadowSamples.push(boxShadow);
          if (s.borderTopStyle !== "none" && s.borderTopWidth !== "0px") borderSamples.push(border);
          if ((s.display === "flex" || s.display === "grid") && el.children.length > 1) layoutSamples.push(describeDisplay(s));

          if (["header", "nav", "main", "section", "article", "aside", "footer", "form", "button", "input", "textarea", "select"].includes(tag)) {
            componentSamples.push(tag);
          }

          if (tag === "nav" || role === "navigation") {
            navigationSamples.push(text ? text.slice(0, 48) : `${tag} block`);
          }

          if (["form", "input", "textarea", "select"].includes(tag)) {
            formSamples.push(`${tag} | ${padding}`);
          }

          if (["h1", "h2", "h3", "h4"].includes(tag)) {
            headingSamples.push(`${tag} | ${fontSize} | ${fontWeight || s.fontWeight}`);
          }

          if (["p", "span", "li", "a", "button", "small", "strong"].includes(tag)) {
            textSizeSamples.push(fontSize);
          }

          if (["h1", "h2", "h3", "p", "span", "a", "button"].includes(tag) && text) {
            contentSamples.push(`${tag}: ${text.slice(0, 42)}`);
          } else if ((className || aria) && ["nav", "menu", "hero", "card", "sidebar", "modal"].some((key) => `${className} ${aria}`.toLowerCase().includes(key))) {
            contentSamples.push(cleanText(`${tag} ${className || aria}`));
          }

          if (textAlign && textAlign !== "start") alignmentSamples.push(textAlign);
          if (gap && gap !== "normal" && gap !== "0px") densitySamples.push(`gap ${gap}`);
          if (padding !== "0px 0px 0px 0px") densitySamples.push(`padding ${padding}`);
          if (fontWeight >= 600 || tag === "strong" || tag === "b") emphasisSamples.push(`${tag} | ${fontWeight || s.fontWeight}`);

          const lowerText = text.toLowerCase();
          if (lowerText) {
            if (["pricing", "features", "login", "sign up", "dashboard", "contact", "download", "book", "shop", "subscribe"].some((word) => lowerText.includes(word))) {
              intentSamples.push(lowerText.slice(0, 48));
            }

            if (["developer", "team", "business", "designer", "creator", "agency", "startup", "enterprise"].some((word) => lowerText.includes(word))) {
              audienceSamples.push(lowerText.slice(0, 48));
            }

            if (["premium", "modern", "simple", "clean", "professional", "elegant", "fast", "powerful"].some((word) => lowerText.includes(word))) {
              toneSamples.push(lowerText.slice(0, 48));
            }
          }

          if (color && color !== "rgba(0, 0, 0, 0)") colorSamples.push(color);
          if (bg && bg !== "rgba(0, 0, 0, 0)") colorSamples.push(bg);
          if (s.fontFamily) fontSamples.push(s.fontFamily.split(",")[0].replace(/['"]/g, ""));
          if (borderRadius && borderRadius !== "0px") radiusSamples.push(borderRadius);
          if (gap && gap !== "normal" && gap !== "0px") spacingSamples.push(`gap ${gap}`);
          if (padding !== "0px 0px 0px 0px") spacingSamples.push(`padding ${padding}`);
          if (margin !== "0px 0px 0px 0px") spacingSamples.push(`margin ${margin}`);
        });

          return {
            url: window.location.href,
            title: document.title || "Untitled",
            colors: pickTop(colorSamples),
            fonts: pickTop(fontSamples, 5),
            radius: pickTop(radiusSamples, 5),
            spacing: pickTop(spacingSamples, 8),
            buttons: pickTop(buttonSamples, 6),
            surfaces: pickTop(surfaceSamples, 6),
            shadows: pickTop(shadowSamples, 4),
            borders: pickTop(borderSamples, 4),
            layout: pickTop(layoutSamples, 6),
            components: pickTop(componentSamples, 8),
            content: pickTop(contentSamples, 6),
            navigation: pickTop(navigationSamples, 4),
            forms: pickTop(formSamples, 4),
            headings: pickTop(headingSamples, 6),
            textSizes: pickTop(textSizeSamples, 6),
            tone: pickTop(toneSamples, 4),
            intent: pickTop(intentSamples, 4),
            audience: pickTop(audienceSamples, 4),
            alignment: pickTop(alignmentSamples, 4),
            density: pickTop(densitySamples, 6),
            emphasis: pickTop(emphasisSamples, 6),
          };
        },
      });

    if (!result) {
      throw new Error("Could not extract styles from this page.");
    }

    state.data = result;
    render();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown extraction error.";
    setError(message);
  } finally {
    elements.refreshButton.disabled = false;
    elements.refreshButton.textContent = "Extract";
  }
};

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.mode = tab.dataset.mode;
    render();
  });
});

elements.profiles.forEach((item) => {
  item.addEventListener("click", () => {
    state.profile = item.dataset.profile;
    render();
  });
});

elements.copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(elements.outputPanel.textContent ?? "");
    const previous = elements.copyButton.textContent;
    elements.copyButton.textContent = "Exported";
    window.setTimeout(() => {
      elements.copyButton.textContent = previous;
    }, 1200);
  } catch {
    setError("Clipboard access failed. Copy manually from the output box.");
  }
});

elements.refreshButton.addEventListener("click", () => {
  void extractFromActiveTab();
});

render();
