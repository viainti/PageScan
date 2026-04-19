"use client";

import { useMemo, useState } from "react";

type ExtractedData = {
  url: string;
  title: string;
  colors: string[];
  fonts: string[];
  radius: string[];
  spacing: string[];
};

const formatList = (items: string[]) => (items.length > 0 ? items.join(", ") : "Not detected");

const getPrompt = (data: ExtractedData, mode: "DESIGN" | "SKILL") => {
  if (mode === "DESIGN") {
    return `# DESIGN.md
## Source
- ${data.title}
- ${data.url}

## Direction
- Clean, modern, production-ready
- Keep the source tone
- Simplify hierarchy and spacing

## Visual Tokens
### Colors
- ${formatList(data.colors)}

### Typography
- ${formatList(data.fonts)}

### Border Radius
- ${formatList(data.radius)}

### Spacing Rhythm
- ${formatList(data.spacing)}

## Rules
- Strong primary action
- Calm secondary UI
- Prioritize scanability`;
  }

  return `# SKILL.md
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

## Behavior
- Inspect the current page
- Capture core visual tokens
- Output concise markdown

## Output Requirements
- Describe palette, type, shape, and spacing
- Capture tone, not only CSS
- Keep it structured and actionable`;
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExtractedData | null>(null);
  const [mode, setMode] = useState<"DESIGN" | "SKILL">("DESIGN");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!data) {
      return "Extract a site to generate a clean DESIGN.md or SKILL.md.";
    }

    return getPrompt(data, mode);
  }, [data, mode]);

  const runExtraction = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!chrome?.tabs?.query || !chrome?.scripting?.executeScript) {
        throw new Error("Chrome extension APIs are unavailable in this context.");
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.id) {
        throw new Error("No active tab found.");
      }

      const blockedProtocols = ["chrome://", "chrome-extension://", "edge://", "about:"];
      const tabUrl = tab.url ?? "";

      if (blockedProtocols.some((protocol) => tabUrl.startsWith(protocol))) {
        throw new Error("Open a regular website tab (http/https) and try again.");
      }

      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const pickTop = (values: string[], limit = 8) => {
            const counts = new Map<string, number>();

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

          const els = [...document.querySelectorAll("*")].slice(0, 1200);
          const colorSamples: string[] = [];
          const fontSamples: string[] = [];
          const radiusSamples: string[] = [];
          const spacingSamples: string[] = [];

          els.forEach((el) => {
            const s = window.getComputedStyle(el as Element);
            const color = s.color;
            const bg = s.backgroundColor;
            const borderRadius = s.borderRadius;
            const gap = s.gap;
            const padding = `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`;
            const margin = `${s.marginTop} ${s.marginRight} ${s.marginBottom} ${s.marginLeft}`;

            if (color && color !== "rgba(0, 0, 0, 0)") colorSamples.push(color);
            if (bg && bg !== "rgba(0, 0, 0, 0)") colorSamples.push(bg);
            if (s.fontFamily) fontSamples.push(s.fontFamily.split(",")[0].replace(/['\"]/g, ""));
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
          };
        },
      });

      if (!result?.result) {
        throw new Error("Could not extract styles from this page.");
      }

      setData(result.result as ExtractedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown extraction error.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setError("Clipboard access failed. Copy manually from the output box.");
    }
  };

  const tokenGroups = data
    ? [
        { label: "Colors", items: data.colors },
        { label: "Fonts", items: data.fonts },
        { label: "Radius", items: data.radius },
        { label: "Spacing", items: data.spacing },
      ]
    : [];

  return (
    <main className="flex min-h-[560px] flex-col p-3">
      <section className="flex min-h-[534px] flex-1 flex-col rounded-[26px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
        <header className="border-b border-[var(--line)] pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--text)] text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(17,24,39,0.16)]">
                PS
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-[14px] font-semibold tracking-[-0.02em] text-[var(--text)]">
                  PageScan extractor
                </h1>
                <p className="mt-0.5 text-[11px] leading-4 text-[var(--text-soft)]">
                  Extract styles from the active tab and generate clean markdown.
                </p>
              </div>
            </div>
            <div className="rounded-full border border-[var(--line)] bg-[var(--surface-subtle)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-soft)]">
              V 0.1
            </div>
          </div>
        </header>

        <div className="mt-4 flex rounded-[16px] bg-[var(--surface-muted)] p-1">
          {(["DESIGN", "SKILL"] as const).map((item) => {
            const active = mode === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`flex-1 rounded-[12px] px-4 py-3 text-[12px] font-semibold transition ${
                  active
                    ? "bg-[var(--text)] text-white shadow-[0_6px_14px_rgba(17,24,39,0.12)]"
                    : "text-[var(--text-soft)] hover:text-[var(--text)]"
                }`}
              >
                {item}.md
              </button>
            );
          })}
        </div>

        {error ? (
          <section className="mt-3 rounded-[16px] border border-[var(--danger-line)] bg-[var(--danger-bg)] px-3 py-2.5 text-[12px] text-[var(--danger-text)]">
            {error}
          </section>
        ) : (
          <section className="mt-3 flex items-center justify-between gap-3 rounded-[16px] border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-[var(--text)]">
                {data?.title ?? "No site extracted yet"}
              </p>
              <p className="truncate text-[10px] text-[var(--text-soft)]">
                {data?.url ?? "Open any website and run extraction"}
              </p>
            </div>
            {data ? (
              <div className="rounded-full bg-[var(--accent)] px-2 py-1 text-[10px] font-semibold text-[var(--brand-strong)]">
                Ready
              </div>
            ) : null}
          </section>
        )}

        <section className="mt-4 flex min-h-0 flex-1 flex-col">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-[12px] font-semibold text-[var(--text)]">Generated Markdown</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyOutput}
                className="rounded-[12px] border border-[var(--line)] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[var(--text)] transition hover:bg-[var(--surface-subtle)]"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={runExtraction}
                disabled={loading}
                className="rounded-[12px] border border-[var(--line)] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[var(--text)] transition hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Running" : "Refresh"}
              </button>
            </div>
          </div>

          <pre className="min-h-[240px] flex-1 overflow-auto rounded-[18px] border border-[var(--line)] bg-white p-3 text-[11px] leading-relaxed text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            {output}
          </pre>
        </section>

        <footer className="mt-4 border-t border-[var(--line)] pt-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[12px] font-semibold text-[var(--text)]">Detected tokens</p>
            {data ? (
              <p className="text-[10px] text-[var(--text-soft)]">
                {data.colors.length + data.fonts.length + data.radius.length + data.spacing.length} items
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {tokenGroups.map((group) => (
              <div key={group.label} className="rounded-[14px] border border-[var(--line)] bg-[var(--surface-subtle)] p-2.5">
                <p className="text-[10px] font-semibold text-[var(--text-soft)]">{group.label}</p>
                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[var(--text)]">
                  {group.items[0] ?? "Not detected"}
                </p>
              </div>
            ))}
          </div>
        </footer>
      </section>
    </main>
  );
}
