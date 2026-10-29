import { blocks, type Inline } from "@/lib/blog";

function Text({ parts }: { parts: Inline[] }) {
  return parts.map((part, i) =>
    typeof part === "string" ? part : <a key={i} href={part.href} target="_blank" rel="noopener noreferrer">{part.text}</a>,
  );
}

/** A post's body: pictures, headings, lists and linked text (lib/blog.ts blocks). Used by /blog and the dashboard. */
export function BlogBody({ body, className }: { body: string; className?: string }) {
  return (
    <div className={className}>
      {blocks(body).map((block, i) => {
        if (block.kind === "image")
          return (
            <figure key={i}>
              {/* Uploaded pictures have no known size, so a plain img; next/image needs one. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.src} alt={block.alt} loading="lazy" />
              {block.alt && <figcaption>{block.alt}</figcaption>}
            </figure>
          );
        if (block.kind === "heading") return <h2 key={i}>{block.text}</h2>;
        if (block.kind === "list") return <ul key={i}>{block.items.map((item, j) => <li key={j}><Text parts={item} /></li>)}</ul>;
        return <p key={i}><Text parts={block.parts} /></p>;
      })}
    </div>
  );
}
