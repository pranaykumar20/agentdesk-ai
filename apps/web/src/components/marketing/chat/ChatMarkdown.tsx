import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export function ChatMarkdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("chat-markdown text-sm leading-relaxed", className)}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-snug">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <p className="mb-2 text-base font-semibold text-foreground">{children}</p>
          ),
          h2: ({ children }) => (
            <p className="mb-2 text-sm font-semibold text-foreground">{children}</p>
          ),
          h3: ({ children }) => (
            <p className="mb-1.5 text-sm font-semibold text-foreground">{children}</p>
          ),
          code: ({ children }) => (
            <code className="rounded bg-background/80 px-1 py-0.5 text-[12px]">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto rounded-lg bg-background/80 p-2 text-[12px] last:mb-0">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-2 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
