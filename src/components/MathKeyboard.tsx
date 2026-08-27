import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Sigma, X } from "lucide-react";
import "./MathKeyboard.css";

const GROUPS = {
  Basic: ["+", "−", "×", "÷", "=", "≠", "<", ">", "≤", "≥", "±", "≈", "∝", "∞"],
  Greek: ["α", "β", "γ", "δ", "θ", "λ", "μ", "π", "σ", "φ", "ω", "Δ", "Σ", "Ω"],
  Calculus: ["√", "∛", "∑", "∫", "∮", "∂", "∇", "lim", "→", "∞", "′", "″"],
  Sets: ["∈", "∉", "⊂", "⊆", "⊃", "⊇", "∪", "∩", "∅", "∀", "∃"],
  Chemistry: ["→", "⇌", "↑", "↓", "°", "·", "⁺", "⁻", "₂", "₃", "₄", "₅"],
  Superscript: ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹", "⁺", "⁻", "ⁿ"],
  Subscript: ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉", "₊", "₋", "ₙ"],
  Fractions: ["½", "⅓", "¼", "⅔", "¾", "⅕", "⅖", "⅗", "⅘", "⅙", "⅚", "⅛", "⅜", "⅝", "⅞"],
} as const;

type GroupName = keyof typeof GROUPS;

const SUPER: Record<string, string> = {
  "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","+":"⁺","-":"⁻","−":"⁻","=":"⁼","(":"⁽",")":"⁾","n":"ⁿ","i":"ⁱ",
};
const SUB: Record<string, string> = {
  "0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉","+":"₊","-":"₋","−":"₋","=":"₌","(":"₍",")":"₎","n":"ₙ",
};

function convertSelected(map: Record<string, string>, fallback: string) {
  const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
  if (!el || (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") || el.dataset.mathInput !== "true") return;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  const selected = el.value.slice(start, end);
  const converted = selected ? selected.split("").map(ch => map[ch] ?? ch).join("") : fallback;
  el.setRangeText(converted, start, end, "end");
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.focus();
}

function insertText(text: string) {
  const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
  if (!el || (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") || el.dataset.mathInput !== "true") return;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  el.setRangeText(text, start, end, "end");
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.focus();
}

export default function MathKeyboard() {
  const [open, setOpen] = useState(true);
  const [group, setGroup] = useState<GroupName>("Basic");
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      setActive(target?.dataset?.mathInput === "true");
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, []);

  const keys = useMemo(() => GROUPS[group], [group]);

  return (
    <section className={`math-keyboard ${open ? "is-open" : "is-closed"}`}>
      <div className="math-keyboard-head">
        <div className="math-keyboard-title">
          <span className="math-keyboard-icon"><Sigma size={17} /></span>
          <div>
            <strong>Math & Science Keyboard</strong>
            <small>{active ? "Field selected — click a symbol to insert" : "Click a question/option/table field first"}</small>
          </div>
        </div>
        <div className="math-keyboard-head-actions">
          <button type="button" onClick={() => setOpen(v => !v)} title={open ? "Collapse" : "Expand"}>
            {open ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
          </button>
        </div>
      </div>

      {open && (
        <>
          <div className="math-keyboard-tabs">
            {(Object.keys(GROUPS) as GroupName[]).map(name => (
              <button key={name} type="button" className={group === name ? "active" : ""} onClick={() => setGroup(name)}>
                {name}
              </button>
            ))}
          </div>

          <div className="math-keyboard-grid">
            {keys.map((key, index) => (
              <button key={`${key}-${index}`} type="button" className="math-key" onMouseDown={e => e.preventDefault()} onClick={() => insertText(key)}>
                {key}
              </button>
            ))}
          </div>

          <div className="math-keyboard-tools">
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => convertSelected(SUPER, "²")}><b>x²</b> Superscript</button>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => convertSelected(SUB, "₂")}><b>x₂</b> Subscript</button>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => insertText("√(")}><b>√( )</b> Root</button>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => insertText("∫ ")}><b>∫</b> Integral</button>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => insertText("⁄")}><b>a⁄b</b> Fraction</button>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => insertText("→")}><b>→</b> Arrow</button>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => insertText("°")}><b>°</b> Degree</button>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => insertText("| |")}>|x| Absolute</button>
            <button type="button" className="clear-math" onClick={() => {
              const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
              if (el?.dataset.mathInput === "true") {
                const start = el.selectionStart ?? 0;
                const end = el.selectionEnd ?? start;
                if (start !== end) {
                  el.setRangeText("", start, end, "start");
                  el.dispatchEvent(new Event("input", { bubbles: true }));
                }
              }
            }}><X size={14} /> Clear selection</button>
          </div>
        </>
      )}
    </section>
  );
}
