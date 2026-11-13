/**
 * Realçador de sintaxe leve, sem dependência externa (decisão de implementação
 * da capability doc-code-block — ver design.md D4 e tasks 2.2). Tokeniza
 * trechos pequenos de `bash`, `json` e `javascript` em tokens com classe
 * `tok-*`, cujas cores vêm de tokens de code theme em globals.css (sem hex no
 * componente). Não interpreta HTML — retorna apenas dados; o componente
 * renderiza cada token como texto, evitando injeção.
 */

export type CodeLang = "bash" | "json" | "javascript" | "text";

export interface CodeToken {
  /** Classe de realce (`tok-*`) ou null para texto sem realce. */
  cls: string | null;
  text: string;
}

type Rule = [string | null, RegExp];

const RULES: Record<CodeLang, Rule[]> = {
  json: [
    ["tok-property", /"(?:\\.|[^"\\])*"(?=\s*:)/y],
    ["tok-string", /"(?:\\.|[^"\\])*"/y],
    ["tok-keyword", /\b(?:true|false|null)\b/y],
    ["tok-number", /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y],
    ["tok-punct", /[{}[\],:]/y],
  ],
  javascript: [
    ["tok-comment", /\/\/[^\n]*/y],
    ["tok-string", /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/y],
    [
      "tok-keyword",
      /\b(?:const|let|var|await|async|function|return|if|else|for|of|in|new|import|from|export|true|false|null|undefined)\b/y,
    ],
    ["tok-property", /(?<=\.)[A-Za-z_$][\w$]*/y],
    ["tok-number", /\b\d+(?:\.\d+)?\b/y],
    ["tok-punct", /[{}()[\];:,.=>]+/y],
  ],
  bash: [
    ["tok-comment", /#[^\n]*/y],
    ["tok-string", /"(?:\\.|[^"\\])*"|'[^']*'/y],
    ["tok-keyword", /\bcurl\b/y],
    ["tok-property", /-{1,2}[A-Za-z][\w-]*/y],
    ["tok-number", /\b\d+\b/y],
    ["tok-punct", /[{}[\]|<>\\]/y],
  ],
  text: [],
};

export function tokenize(code: string, lang: CodeLang): CodeToken[] {
  const rules = RULES[lang] ?? RULES.text;
  if (rules.length === 0) return [{ cls: null, text: code }];

  const tokens: CodeToken[] = [];
  let plain = "";
  let pos = 0;

  const flush = () => {
    if (plain) {
      tokens.push({ cls: null, text: plain });
      plain = "";
    }
  };

  while (pos < code.length) {
    let matched = false;
    for (const [cls, re] of rules) {
      re.lastIndex = pos;
      const m = re.exec(code);
      if (m && m.index === pos && m[0].length > 0) {
        flush();
        tokens.push({ cls, text: m[0] });
        pos += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      plain += code[pos];
      pos += 1;
    }
  }
  flush();
  return tokens;
}
