// Bun 1.3.8+ has unstable Bun.markdown.react without deps - use it when available (SSR/Bun), fallback to lightweight parser for browser
import React from "react";

declare const Bun: any;

// Inline parser: **bold**, *italic*, `code`, [link](url), ~strike~
function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // regex order matters: code, link, bold+italic, bold, italic, strike
  const re = /(`[^`]+`|\[.+?\]\(.+?\)|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|~~[^~]+~~)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(<code key={`${keyPrefix}-c-${idx++}`} style={{ background: "#f3f4f6", padding: "1px 6px", borderRadius: 4, fontSize: "0.9em", fontFamily: "monospace" }}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("[") && token.includes("](")) {
      const mm = /^\[(.+?)\]\((.+?)\)$/.exec(token);
      if (mm) nodes.push(<a key={`${keyPrefix}-a-${idx++}`} href={mm[2]!} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>{parseInline(mm[1]!, `${keyPrefix}-a-${idx}`)}</a>);
      else nodes.push(token);
    } else if (token.startsWith("***") && token.endsWith("***")) {
      nodes.push(<strong key={`${keyPrefix}-b-${idx++}`}><em>{token.slice(3, -3)}</em></strong>);
    } else if ((token.startsWith("**") && token.endsWith("**")) || (token.startsWith("__") && token.endsWith("__"))) {
      nodes.push(<strong key={`${keyPrefix}-b-${idx++}`}>{parseInline(token.slice(2, -2), `${keyPrefix}-b-${idx}`)}</strong>);
    } else if ((token.startsWith("*") && token.endsWith("*")) || (token.startsWith("_") && token.endsWith("_"))) {
      nodes.push(<em key={`${keyPrefix}-i-${idx++}`}>{parseInline(token.slice(1, -1), `${keyPrefix}-i-${idx}`)}</em>);
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      nodes.push(<s key={`${keyPrefix}-s-${idx++}`}>{token.slice(2, -2)}</s>);
    } else nodes.push(token);
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length ? nodes : [text];
}

function FallbackMarkdown({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);
  return (
    <div style={{ fontSize: 14, lineHeight: 1.6 }}>
      {blocks.map((block, bi) => {
        const t = block.trim();
        if (!t) return null;
        // code block
        if (t.startsWith("```")) {
          const m = /^```(\w*)\n([\s\S]*?)```$/.exec(t);
          const code = m ? m[2]! : t.replace(/^```/, "").replace(/```$/, "");
          const lang = m?.[1];
          return (
            <pre key={bi} style={{ background: "#111827", color: "#e5e7eb", padding: 12, borderRadius: 8, overflowX: "auto", margin: "8px 0", fontSize: 12 }}>
              {lang && <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 6 }}>{lang}</div>}
              <code>{code!.trim()}</code>
            </pre>
          );
        }
        // heading
        if (/^#{1,6}\s/.test(t)) {
          const m = /^(#{1,6})\s+(.*)$/.exec(t);
          if (m) {
            const lvl = m[1]!.length;
            const text = m[2]!;
            const style: React.CSSProperties = { fontWeight: 700, margin: "10px 0 6px", lineHeight: 1.3 };
            if (lvl === 1) style.fontSize = 18;
            else if (lvl === 2) style.fontSize = 16;
            else if (lvl === 3) style.fontSize = 14;
            else style.fontSize = 13;
            const Tag: any = `h${lvl}`;
            return <Tag key={bi} style={style}>{parseInline(text, `h-${bi}`)}</Tag>;
          }
        }
        // blockquote
        if (t.startsWith("> ")) {
          return <blockquote key={bi} style={{ borderLeft: "3px solid #d1d5db", paddingLeft: 10, margin: "8px 0", opacity: 0.8, fontStyle: "italic" }}>{parseInline(t.replace(/^>\s?/gm, ""), `bq-${bi}`)}</blockquote>;
        }
        // hr
        if (/^---+$/.test(t) || /^\*\*\*+$/.test(t)) return <hr key={bi} style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "12px 0" }} />;
        // ordered list
        if (/^\d+\.\s/m.test(t)) {
          const items = t.split("\n").filter((l) => /^\d+\.\s/.test(l.trim()));
          if (items.length) return <ol key={bi} style={{ margin: "8px 0 8px 20px", listStyle: "decimal" }}>{items.map((it, i) => <li key={i} style={{ marginTop: 4 }}>{parseInline(it.replace(/^\d+\.\s/, ""), `ol-${bi}-${i}`)}</li>)}</ol>;
        }
        // unordered list
        if (/^[-*+]\s/m.test(t)) {
          const items = t.split("\n").filter((l) => /^[-*+]\s/.test(l.trim()));
          if (items.length) return <ul key={bi} style={{ margin: "8px 0 8px 20px", listStyle: "disc" }}>{items.map((it, i) => <li key={i} style={{ marginTop: 4 }}>{parseInline(it.replace(/^[-*+]\s/, ""), `ul-${bi}-${i}`)}</li>)}</ul>;
        }
        // table simple: | a | b |
        if (t.includes("|") && t.split("\n").every((l) => l.includes("|"))) {
          const rows = t.split("\n").filter(Boolean);
          const dataRows = rows.filter((r) => !/^\|?\s*:?-+:?\s*\|/.test(r));
          return (
            <table key={bi} style={{ width: "100%", borderCollapse: "collapse", margin: "8px 0", fontSize: 13 }}>
              <tbody>
                {dataRows.map((row, ri) => (
                  <tr key={ri}>
                    {row.split("|").filter(Boolean).map((cell, ci) => {
                      const Tag2: any = ri === 0 ? "th" : "td";
                      return <Tag2 key={ci} style={{ border: "1px solid #e5e7eb", padding: "6px 8px", textAlign: "left", background: ri === 0 ? "#f9fafb" : "transparent", fontWeight: ri === 0 ? 700 : 400 }}>{parseInline(cell.trim(), `tbl-${bi}-${ri}-${ci}`)}</Tag2>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }
        // paragraph
        return <p key={bi} style={{ margin: "8px 0" }}>{parseInline(t, `p-${bi}`)}</p>;
      })}
    </div>
  );
}

export function Markdown({ content }: { content: string }) {
  // Try Bun.markdown.react when running in Bun (SSR) - unstable since 1.3.8, tanpa deps
  try {
    const bunMd: any = typeof Bun !== "undefined" ? (Bun as any).markdown : undefined;
    if (bunMd?.react) {
      const node = bunMd.react(content);
      // Bun returns React fragment, wrap with prose styling
      return <div style={{ fontSize: 14, lineHeight: 1.6 }}>{node}</div>;
    }
  } catch {
    // fallthrough
  }
  return <FallbackMarkdown content={content} />;
}

export default Markdown;
