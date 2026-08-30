import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Sigma,
  X,
  Delete,
  Space,
} from "lucide-react";
import "./MathKeyboard.css";

// ============================================================
// EXAMMASTER — ADVANCED MATH & SCIENCE KEYBOARD
// ============================================================

const GROUPS = {
  Basic: [
    "+",
    "−",
    "×",
    "÷",
    "=",
    "≠",
    "<",
    ">",
    "≤",
    "≥",
    "±",
    "≈",
    "≃",
    "≅",
    "≡",
    "∝",
    "∞",
    "%",
    "·",
    "√",
    "∛",
    "∜",
  ],

  Letters: [
    // CAPITAL
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",

    // SMALL
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ],

  Greek: [
    // SMALL
    "α",
    "β",
    "γ",
    "δ",
    "ε",
    "ζ",
    "η",
    "θ",
    "ι",
    "κ",
    "λ",
    "μ",
    "ν",
    "ξ",
    "ο",
    "π",
    "ρ",
    "σ",
    "τ",
    "υ",
    "φ",
    "χ",
    "ψ",
    "ω",

    // CAPITAL
    "Α",
    "Β",
    "Γ",
    "Δ",
    "Ε",
    "Ζ",
    "Η",
    "Θ",
    "Ι",
    "Κ",
    "Λ",
    "Μ",
    "Ν",
    "Ξ",
    "Ο",
    "Π",
    "Ρ",
    "Σ",
    "Τ",
    "Υ",
    "Φ",
    "Χ",
    "Ψ",
    "Ω",
  ],

  Algebra: [
    "x",
    "y",
    "z",
    "a",
    "b",
    "c",
    "A",
    "B",
    "C",
    "m",
    "n",
    "p",
    "q",
    "k",
    "f(x)",
    "g(x)",
    "|x|",
    "⌊x⌋",
    "⌈x⌉",
    "∴",
    "∵",
    "∝",
    "≠",
    "≈",
    "≡",
  ],

  Calculus: [
    "√",
    "∛",
    "∜",
    "∑",
    "∏",
    "∫",
    "∬",
    "∭",
    "∮",
    "∂",
    "∇",
    "lim",
    "→",
    "∞",
    "′",
    "″",
    "‴",
    "Δ",
    "δ",
    "ε",
    "dx",
    "dy",
    "dt",
    "d/dx",
    "d/dt",
  ],

  Geometry: [
    "∠",
    "∟",
    "°",
    "△",
    "▲",
    "▽",
    "▼",
    "□",
    "■",
    "◇",
    "◆",
    "○",
    "●",
    "⊥",
    "∥",
    "≅",
    "∼",
    "π",
    "r",
    "d",
    "l",
    "h",
    "A",
    "P",
    "V",
  ],

  Trigonometry: [
    "sin",
    "cos",
    "tan",
    "cot",
    "sec",
    "csc",
    "sin⁻¹",
    "cos⁻¹",
    "tan⁻¹",
    "cot⁻¹",
    "sec⁻¹",
    "csc⁻¹",
    "sinh",
    "cosh",
    "tanh",
    "sin²",
    "cos²",
    "tan²",
    "θ",
    "α",
    "β",
    "π",
    "π/2",
    "π/3",
    "π/4",
    "π/6",
    "2π",
  ],

  Sets: [
    "∈",
    "∉",
    "∋",
    "∌",
    "⊂",
    "⊆",
    "⊃",
    "⊇",
    "∪",
    "∩",
    "∅",
    "∀",
    "∃",
    "∄",
    "ℕ",
    "ℤ",
    "ℚ",
    "ℝ",
    "ℂ",
    "ℙ",
    "A′",
    "Aᶜ",
    "|A|",
  ],

  Logic: [
    "¬",
    "∧",
    "∨",
    "⊕",
    "⇒",
    "⇔",
    "→",
    "←",
    "↔",
    "⟹",
    "⟺",
    "∀",
    "∃",
    "∄",
    "∴",
    "∵",
    "⊤",
    "⊥",
  ],

  Physics: [
    "F",
    "m",
    "a",
    "v",
    "u",
    "s",
    "t",
    "g",
    "p",
    "E",
    "W",
    "P",
    "Q",
    "I",
    "V",
    "R",
    "C",
    "L",
    "T",
    "f",
    "λ",
    "μ",
    "ρ",
    "η",
    "ω",
    "α",
    "β",
    "γ",
    "Δ",
    "θ",
    "ℏ",
    "ħ",
    "Ω",
    "Φ",
    "ε₀",
    "μ₀",
  ],

  Chemistry: [
    "H",
    "He",
    "Li",
    "Be",
    "B",
    "C",
    "N",
    "O",
    "F",
    "Ne",
    "Na",
    "Mg",
    "Al",
    "Si",
    "P",
    "S",
    "Cl",
    "Ar",
    "K",
    "Ca",
    "Fe",
    "Cu",
    "Zn",
    "Ag",
    "Au",
    "Hg",
    "Pb",
    "→",
    "⇌",
    "↑",
    "↓",
    "°",
    "·",
    "⁺",
    "⁻",
    "²⁺",
    "²⁻",
    "³⁺",
    "³⁻",
    "aq",
    "(s)",
    "(l)",
    "(g)",
  ],

  Statistics: [
    "x̄",
    "ȳ",
    "μ",
    "σ",
    "σ²",
    "s",
    "s²",
    "n",
    "N",
    "Σ",
    "∑",
    "P(A)",
    "P(B)",
    "P(A∩B)",
    "P(A∪B)",
    "P(A|B)",
    "E(X)",
    "Var(X)",
    "SD",
    "CV",
  ],

  Superscript: [
    // NUMBERS
    "⁰",
    "¹",
    "²",
    "³",
    "⁴",
    "⁵",
    "⁶",
    "⁷",
    "⁸",
    "⁹",

    // OPERATORS
    "⁺",
    "⁻",
    "⁼",
    "⁽",
    "⁾",

    // SMALL LETTERS
    "ᵃ",
    "ᵇ",
    "ᶜ",
    "ᵈ",
    "ᵉ",
    "ᶠ",
    "ᵍ",
    "ʰ",
    "ⁱ",
    "ʲ",
    "ᵏ",
    "ˡ",
    "ᵐ",
    "ⁿ",
    "ᵒ",
    "ᵖ",
    "ʳ",
    "ˢ",
    "ᵗ",
    "ᵘ",
    "ᵛ",
    "ʷ",
    "ˣ",
    "ʸ",
    "ᶻ",

    // CAPITAL-LIKE SUPERSCRIPT
    "ᴬ",
    "ᴮ",
    "ᴰ",
    "ᴱ",
    "ᴳ",
    "ᴴ",
    "ᴵ",
    "ᴶ",
    "ᴷ",
    "ᴸ",
    "ᴹ",
    "ᴺ",
    "ᴼ",
    "ᴾ",
    "ᴿ",
    "ᵀ",
    "ᵁ",
    "ⱽ",
    "ᵂ",
  ],

  Subscript: [
    // NUMBERS
    "₀",
    "₁",
    "₂",
    "₃",
    "₄",
    "₅",
    "₆",
    "₇",
    "₈",
    "₉",

    // OPERATORS
    "₊",
    "₋",
    "₌",
    "₍",
    "₎",

    // AVAILABLE SMALL SUBSCRIPT LETTERS
    "ₐ",
    "ₑ",
    "ₕ",
    "ᵢ",
    "ⱼ",
    "ₖ",
    "ₗ",
    "ₘ",
    "ₙ",
    "ₒ",
    "ₚ",
    "ᵣ",
    "ₛ",
    "ₜ",
    "ᵤ",
    "ᵥ",
    "ₓ",

    // CAPITAL LETTER STYLE / MODIFIER LETTERS
    "ᴬ",
    "ᴮ",
    "ᶜ",
    "ᴰ",
    "ᴱ",
    "ᴳ",
    "ᴴ",
    "ᴵ",
    "ᴶ",
    "ᴷ",
    "ᴸ",
    "ᴹ",
    "ᴺ",
    "ᴼ",
    "ᴾ",
    "ᴿ",
    "ᵀ",
    "ᵁ",
    "ⱽ",
    "ᵂ",
  ],

  Fractions: [
    "½",
    "⅓",
    "¼",
    "⅕",
    "⅙",
    "⅛",
    "⅔",
    "¾",
    "⅖",
    "⅗",
    "⅘",
    "⅚",
    "⅜",
    "⅝",
    "⅞",
    "⁄",
    "a⁄b",
    "x⁄y",
    "1⁄2",
    "1⁄3",
    "1⁄4",
    "2⁄3",
    "3⁄4",
  ],

  Units: [
    "m",
    "cm",
    "mm",
    "km",
    "μm",
    "nm",
    "kg",
    "g",
    "mg",
    "s",
    "ms",
    "min",
    "h",
    "A",
    "V",
    "W",
    "J",
    "N",
    "Pa",
    "Hz",
    "Ω",
    "C",
    "F",
    "T",
    "Wb",
    "mol",
    "K",
    "°C",
    "°F",
  ],

  Arrows: [
    "→",
    "←",
    "↔",
    "↑",
    "↓",
    "↗",
    "↘",
    "↙",
    "↖",
    "⇒",
    "⇐",
    "⇔",
    "⟶",
    "⟵",
    "⟷",
    "⟹",
    "⟸",
    "⟺",
    "↦",
    "↪",
    "↩",
    "⇌",
    "⇋",
  ],

  Brackets: [
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "⟨",
    "⟩",
    "⌈",
    "⌉",
    "⌊",
    "⌋",
    "|",
    "‖",
    "⟦",
    "⟧",
  ],
} as const;

type GroupName = keyof typeof GROUPS;

// ============================================================
// SUPERSCRIPT MAP
// ============================================================

const SUPER: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",

  "+": "⁺",
  "-": "⁻",
  "−": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",

  a: "ᵃ",
  b: "ᵇ",
  c: "ᶜ",
  d: "ᵈ",
  e: "ᵉ",
  f: "ᶠ",
  g: "ᵍ",
  h: "ʰ",
  i: "ⁱ",
  j: "ʲ",
  k: "ᵏ",
  l: "ˡ",
  m: "ᵐ",
  n: "ⁿ",
  o: "ᵒ",
  p: "ᵖ",
  r: "ʳ",
  s: "ˢ",
  t: "ᵗ",
  u: "ᵘ",
  v: "ᵛ",
  w: "ʷ",
  x: "ˣ",
  y: "ʸ",
  z: "ᶻ",

  A: "ᴬ",
  B: "ᴮ",
  D: "ᴰ",
  E: "ᴱ",
  G: "ᴳ",
  H: "ᴴ",
  I: "ᴵ",
  J: "ᴶ",
  K: "ᴷ",
  L: "ᴸ",
  M: "ᴹ",
  N: "ᴺ",
  O: "ᴼ",
  P: "ᴾ",
  R: "ᴿ",
  T: "ᵀ",
  U: "ᵁ",
  V: "ⱽ",
  W: "ᵂ",
};

// ============================================================
// SUBSCRIPT MAP
// ============================================================

const SUB: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",

  "+": "₊",
  "-": "₋",
  "−": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",

  a: "ₐ",
  e: "ₑ",
  h: "ₕ",
  i: "ᵢ",
  j: "ⱼ",
  k: "ₖ",
  l: "ₗ",
  m: "ₘ",
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  r: "ᵣ",
  s: "ₛ",
  t: "ₜ",
  u: "ᵤ",
  v: "ᵥ",
  x: "ₓ",

  // Unicode doesn't have true subscript
  // A-Z for every letter.
  // These are the closest modifier-style forms
  // available for many capital letters.
  A: "ₐ",
  E: "ₑ",
  H: "ₕ",
  I: "ᵢ",
  J: "ⱼ",
  K: "ₖ",
  L: "ₗ",
  M: "ₘ",
  N: "ₙ",
  O: "ₒ",
  P: "ₚ",
  R: "ᵣ",
  S: "ₛ",
  T: "ₜ",
  U: "ᵤ",
  V: "ᵥ",
  X: "ₓ",
};

// ============================================================
// ACTIVE INPUT
// ============================================================

function getActiveMathElement():
  | HTMLInputElement
  | HTMLTextAreaElement
  | null {
  const el = document.activeElement as
    | HTMLInputElement
    | HTMLTextAreaElement
    | null;

  if (
    !el ||
    (el.tagName !== "INPUT" &&
      el.tagName !== "TEXTAREA") ||
    el.dataset.mathInput !== "true"
  ) {
    return null;
  }

  return el;
}

// ============================================================
// INSERT TEXT
// ============================================================

function insertText(text: string) {
  const el = getActiveMathElement();

  if (!el) return;

  const start =
    el.selectionStart ?? el.value.length;

  const end =
    el.selectionEnd ?? start;

  el.setRangeText(
    text,
    start,
    end,
    "end"
  );

  el.dispatchEvent(
    new Event("input", {
      bubbles: true,
    })
  );

  el.focus();
}

// ============================================================
// CONVERT SELECTED
// ============================================================

function convertSelected(
  map: Record<string, string>,
  fallback: string
) {
  const el = getActiveMathElement();

  if (!el) return;

  const start =
    el.selectionStart ?? el.value.length;

  const end =
    el.selectionEnd ?? start;

  const selected =
    el.value.slice(start, end);

  // If text selected:
  // convert every character.
  //
  // Example:
  // V3  -> V₃
  // ABC -> ᴬᴮC (depending on Unicode support)
  //
  // If nothing selected:
  // insert fallback.

  const converted = selected
    ? Array.from(selected)
        .map((char) => map[char] ?? char)
        .join("")
    : fallback;

  el.setRangeText(
    converted,
    start,
    end,
    "end"
  );

  el.dispatchEvent(
    new Event("input", {
      bubbles: true,
    })
  );

  el.focus();
}

// ============================================================
// BACKSPACE
// ============================================================

function deletePreviousCharacter() {
  const el = getActiveMathElement();

  if (!el) return;

  const start =
    el.selectionStart ?? el.value.length;

  const end =
    el.selectionEnd ?? start;

  if (start !== end) {
    el.setRangeText(
      "",
      start,
      end,
      "start"
    );
  } else if (start > 0) {
    el.setRangeText(
      "",
      start - 1,
      start,
      "start"
    );
  }

  el.dispatchEvent(
    new Event("input", {
      bubbles: true,
    })
  );

  el.focus();
}

// ============================================================
// DELETE
// ============================================================

function deleteNextCharacter() {
  const el = getActiveMathElement();

  if (!el) return;

  const start =
    el.selectionStart ?? el.value.length;

  const end =
    el.selectionEnd ?? start;

  if (start !== end) {
    el.setRangeText(
      "",
      start,
      end,
      "start"
    );
  } else if (
    start < el.value.length
  ) {
    el.setRangeText(
      "",
      start,
      start + 1,
      "start"
    );
  }

  el.dispatchEvent(
    new Event("input", {
      bubbles: true,
    })
  );

  el.focus();
}

// ============================================================
// SPACE
// ============================================================

function insertSpace() {
  insertText(" ");
}

// ============================================================
// SELECT ALL
// ============================================================

function selectAllMathText() {
  const el = getActiveMathElement();

  if (!el) return;

  el.focus();

  el.setSelectionRange(
    0,
    el.value.length
  );
}

// ============================================================
// CLEAR SELECTION
// ============================================================

function clearSelection() {
  const el = getActiveMathElement();

  if (!el) return;

  const start =
    el.selectionStart ?? 0;

  const end =
    el.selectionEnd ?? start;

  if (start !== end) {
    el.setRangeText(
      "",
      start,
      end,
      "start"
    );

    el.dispatchEvent(
      new Event("input", {
        bubbles: true,
      })
    );
  }

  el.focus();
}

// ============================================================
// COMPONENT
// ============================================================

export default function MathKeyboard() {
  const [open, setOpen] =
    useState(true);

  const [group, setGroup] =
    useState<GroupName>("Basic");

  const [active, setActive] =
    useState(false);

  // ==========================================================
  // TRACK ACTIVE FIELD
  // ==========================================================

  useEffect(() => {
    const onFocus = (
      event: FocusEvent
    ) => {
      const target =
        event.target as HTMLElement | null;

      setActive(
        target?.dataset?.mathInput ===
          "true"
      );
    };

    const onBlur = () => {
      setTimeout(() => {
        setActive(
          Boolean(
            getActiveMathElement()
          )
        );
      }, 0);
    };

    document.addEventListener(
      "focusin",
      onFocus
    );

    document.addEventListener(
      "focusout",
      onBlur
    );

    return () => {
      document.removeEventListener(
        "focusin",
        onFocus
      );

      document.removeEventListener(
        "focusout",
        onBlur
      );
    };
  }, []);

  const keys = useMemo(
    () => GROUPS[group],
    [group]
  );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section
      className={`math-keyboard ${
        open
          ? "is-open"
          : "is-closed"
      }`}
    >
      {/* ====================================================
          HEADER
      ===================================================== */}

      <div className="math-keyboard-head">
        <div className="math-keyboard-title">
          <span className="math-keyboard-icon">
            <Sigma size={17} />
          </span>

          <div>
            <strong>
              Math & Science Keyboard
            </strong>

            <small>
              {active
                ? "Field selected — choose a symbol"
                : "Click a question, option or table field first"}
            </small>
          </div>
        </div>

        <div className="math-keyboard-head-actions">
          <button
            type="button"
            onClick={() =>
              setOpen(
                (value) => !value
              )
            }
            title={
              open
                ? "Collapse"
                : "Expand"
            }
          >
            {open ? (
              <ChevronDown
                size={17}
              />
            ) : (
              <ChevronUp
                size={17}
              />
            )}
          </button>
        </div>
      </div>

      {open && (
        <>
          {/* =================================================
              TABS
          ================================================== */}

          <div className="math-keyboard-tabs">
            {(
              Object.keys(
                GROUPS
              ) as GroupName[]
            ).map((name) => (
              <button
                key={name}
                type="button"
                className={
                  group === name
                    ? "active"
                    : ""
                }
                onMouseDown={(e) =>
                  e.preventDefault()
                }
                onClick={() =>
                  setGroup(name)
                }
              >
                {name}
              </button>
            ))}
          </div>

          {/* =================================================
              SYMBOL GRID
          ================================================== */}

          <div className="math-keyboard-grid">
            {keys.map(
              (key, index) => (
                <button
                  key={`${key}-${index}`}
                  type="button"
                  className="math-key"
                  onMouseDown={(e) =>
                    e.preventDefault()
                  }
                  onClick={() =>
                    insertText(key)
                  }
                  title={`Insert ${key}`}
                >
                  {key}
                </button>
              )
            )}
          </div>

          {/* =================================================
              QUICK TOOLS
          ================================================== */}

          <div className="math-keyboard-tools">
            {/* SUPERSCRIPT */}

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={() =>
                convertSelected(
                  SUPER,
                  "²"
                )
              }
              title="Convert selected text to superscript"
            >
              <b>x²</b>
              <span>
                Superscript
              </span>
            </button>

            {/* SUBSCRIPT */}

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={() =>
                convertSelected(
                  SUB,
                  "₂"
                )
              }
              title="Convert selected text to subscript"
            >
              <b>x₂</b>
              <span>
                Subscript
              </span>
            </button>

            {/* ROOT */}

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={() =>
                insertText("√(")
              }
            >
              <b>√( )</b>
              <span>Root</span>
            </button>

            {/* CUBE ROOT */}

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={() =>
                insertText("∛(")
              }
            >
              <b>∛( )</b>
              <span>
                Cube Root
              </span>
            </button>

            {/* INTEGRAL */}

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={() =>
                insertText("∫ ")
              }
            >
              <b>∫</b>
              <span>
                Integral
              </span>
            </button>

            {/* SUM */}

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={() =>
                insertText("∑ ")
              }
            >
              <b>∑</b>
              <span>Sum</span>
            </button>

            {/* FRACTION */}

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={() =>
                insertText("⁄")
              }
            >
              <b>a⁄b</b>
              <span>
                Fraction
              </span>
            </button>

            {/* ABSOLUTE */}

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={() =>
                insertText("|x|")
              }
            >
              <b>|x|</b>
              <span>
                Absolute
              </span>
            </button>

            {/* DEGREE */}

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={() =>
                insertText("°")
              }
            >
              <b>°</b>
              <span>
                Degree
              </span>
            </button>

            {/* PI */}

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={() =>
                insertText("π")
              }
            >
              <b>π</b>
              <span>Pi</span>
            </button>

            {/* DELTA */}

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={() =>
                insertText("Δ")
              }
            >
              <b>Δ</b>
              <span>
                Delta
              </span>
            </button>

            {/* INFINITY */}

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={() =>
                insertText("∞")
              }
            >
              <b>∞</b>
              <span>
                Infinity
              </span>
            </button>
          </div>

          {/* =================================================
              EDITING
          ================================================== */}

          <div className="math-keyboard-edit-tools">
            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={
                deletePreviousCharacter
              }
            >
              <Delete size={15} />
              Backspace
            </button>

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={
                deleteNextCharacter
              }
            >
              <X size={14} />
              Delete
            </button>

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={
                insertSpace
              }
            >
              <Space size={15} />
              Space
            </button>

            <button
              type="button"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={
                selectAllMathText
              }
            >
              Select All
            </button>

            <button
              type="button"
              className="clear-math"
              onMouseDown={(e) =>
                e.preventDefault()
              }
              onClick={
                clearSelection
              }
            >
              <X size={14} />
              Clear Selection
            </button>
          </div>
        </>
      )}
    </section>
  );
}