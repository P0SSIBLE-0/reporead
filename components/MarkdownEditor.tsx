interface MarkdownEditorProps {
  markdown: string;
  setMarkdown: (md: string) => void;
  tab: string;
}

export default function MarkdownEditor({ markdown, setMarkdown, tab }: MarkdownEditorProps) {
  return (
    <section
      className={`flex min-w-0 flex-col border-hairline md:border-r ${tab === "preview" ? "hidden md:flex" : "flex"} bg-zinc-950`}
      aria-label="Markdown editor"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/50">
        <div>
          <h2 className="font-semibold text-zinc-100 text-sm sm:text-base leading-tight">Markdown</h2>
          <p className="mt-0.5 text-xs text-zinc-400 leading-tight">Edit before you export.</p>
        </div>
        <span className="font-mono text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">README.md</span>
      </div>
      <textarea
        aria-label="Generated README Markdown"
        value={markdown}
        onChange={(event) => setMarkdown(event.target.value)}
        spellCheck={false}
        className="min-h-[520px] flex-1 resize-none border-0 bg-zinc-950 p-5 font-mono text-sm leading-6 text-zinc-300 outline-none focus:bg-zinc-900/10 transition-colors duration-150 dark-scrollbar dark-selection"
      />
    </section>
  );
}
