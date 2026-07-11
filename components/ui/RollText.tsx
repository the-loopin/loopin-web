"use client";

export function RollText({ text }: { text: string }) {
  return (
    <span className="roll-text" aria-label={text}>
      {text.split("").map((char, i) => {
        const isSpace = char === " ";
        const visibleChar = isSpace ? "\u00A0" : char;

        return (
          <span
            key={`${char}-${i}`}
            className="roll-letter"
            data-char={visibleChar}
            style={{ transitionDelay: `${i * 15}ms` }}
            aria-hidden="true"
          >
            <span
              className="roll-letter-placeholder"
            >
              {visibleChar}
            </span>
          </span>
        );
      })}
    </span>
  );
}

