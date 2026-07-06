import * as React from 'react';

// Matches: "key": | "string" | true/false/null | numbers — anything else is punctuation.
const JSON_TOKEN_RE =
  /("(?:\\.|[^"\\])*")(\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

/** Tokenize raw JSON text into colored spans. Tolerates invalid JSON. */
export function highlightJson(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  JSON_TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  const punct = (s: string) =>
    nodes.push(
      <span key={i++} className="text-json-punct">
        {s}
      </span>,
    );
  while ((m = JSON_TOKEN_RE.exec(text))) {
    if (m.index > last) punct(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(
        <span key={i++} className="text-json-key">
          {m[1]}
        </span>,
      );
      punct(m[2]);
    } else if (m[3] !== undefined) {
      nodes.push(
        <span key={i++} className="text-json-string">
          {m[3]}
        </span>,
      );
    } else if (m[4] !== undefined) {
      nodes.push(
        <span key={i++} className="text-json-literal">
          {m[4]}
        </span>,
      );
    } else {
      nodes.push(
        <span key={i++} className="text-json-number">
          {m[5]}
        </span>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) punct(text.slice(last));
  return nodes;
}

/** Color a JWT's header.payload.signature sections jwt.io-style. */
export function highlightJwt(text: string): React.ReactNode[] {
  const classes = ['text-token-header', 'text-token-payload', 'text-token-signature'];
  return text.split('.').flatMap((part, idx) => {
    const nodes: React.ReactNode[] = [];
    if (idx > 0) {
      nodes.push(
        <span key={`dot-${idx}`} className="text-muted-foreground">
          .
        </span>,
      );
    }
    nodes.push(
      <span key={idx} className={classes[Math.min(idx, 2)]}>
        {part}
      </span>,
    );
    return nodes;
  });
}
