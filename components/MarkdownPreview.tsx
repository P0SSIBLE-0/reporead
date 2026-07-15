import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  markdown: string;
  tab: string;
}

export default function MarkdownPreview({ markdown, tab }: MarkdownPreviewProps) {
  return (
    <section
      className={`min-w-0 flex flex-col ${tab === "editor" ? "hidden md:flex" : "flex"} bg-canvas`}
      aria-label="Rendered README preview"
    >
      <div className="px-5 py-4 border-b border-hairline bg-canvas-soft/10">
        <h2 className="font-semibold text-ink text-sm sm:text-base leading-tight">Preview</h2>
        <p className="mt-0.5 text-xs text-mute leading-tight">How your README will render on GitHub.</p>
      </div>
      <article className="markdown-body min-h-[548px] flex-1 overflow-y-auto bg-canvas p-4 sm:p-7">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
          {markdown}
        </ReactMarkdown>
      </article>
    </section>
  );
}
