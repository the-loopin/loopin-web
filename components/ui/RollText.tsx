"use client";

export function RollText({ text }: { text: string }) {
  return (
    <span className="inline-flex">
      {text.split("").map((char, i) => {
        const isSpace = char === " ";
        return (
          <span key={i} className="relative inline-flex overflow-hidden">
            {/* Invisible placeholder to establish the layout width/height */}
            <span className="invisible">{isSpace ? "\u00A0" : char}</span>
            
            {/* Sliding column containing original and duplicate characters */}
            <span
              className="absolute left-0 top-0 flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-1/2 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
              style={{ transitionDelay: `${i * 15}ms` }}
            >
              <span>{isSpace ? "\u00A0" : char}</span>
              <span className="text-[var(--color-teal)]" aria-hidden="true">
                {isSpace ? "\u00A0" : char}
              </span>
            </span>
          </span>
        );
      })}
    </span>
  );
}

