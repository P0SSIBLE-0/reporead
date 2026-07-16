import { ArrowLeft, Check, Clipboard, Save, Download } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface WorkspaceHeaderProps {
  activeSavedId: string | null;
  copied: boolean;
  saveSuccess: boolean;
  title: string;
  isCustom?: boolean;
  onRename?: (newName: string) => void;
  copyMarkdown: () => void;
  handleSave: () => void;
  downloadMarkdown: () => void;
  handleCloseWorkspace: () => void;
}

export default function WorkspaceHeader({
  activeSavedId,
  copied,
  saveSuccess,
  title,
  isCustom = false,
  onRename,
  copyMarkdown,
  handleSave,
  downloadMarkdown,
  handleCloseWorkspace,
}: WorkspaceHeaderProps) {
  return (
    <div className="sticky top-2 z-40 bg-canvas-soft/90 backdrop-blur-md px-2 py-4  border-hairline/30 mb-1 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button
          onClick={handleCloseWorkspace}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-body hover:text-ink font-mono cursor-pointer transition-colors shrink-0"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to Library</span>
          <span className="sm:hidden">Back</span>
        </button>

        <div className="h-4 w-px bg-hairline shrink-0" />

        {isCustom ? (
          <input
            type="text"
            value={title}
            onChange={(e) => onRename?.(e.target.value)}
            placeholder="Untitled document"
            className="bg-transparent border-b border-transparent hover:border-hairline focus:border-hairline-strong focus:outline-none px-1.5 py-0.5 transition-all font-sans font-semibold text-sm text-ink max-w-[150px] sm:max-w-[300px] truncate"
          />
        ) : (
          <span className="font-sans font-semibold text-ink text-sm max-w-[150px] sm:max-w-[300px] truncate" title={title}>
            {isCustom && title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Copy Button */}
        <button
          onClick={copyMarkdown}
          aria-label="Copy Markdown"
          className="inline-flex h-7.5 items-center gap-1.5 rounded border border-hairline cursor-pointer bg-canvas px-2.5 font-mono text-sm font-medium text-body hover:bg-canvas-soft-2 hover:text-ink active:scale-[0.99] transition-all duration-150"
        >
          <div className="relative size-3.5 flex items-center justify-center shrink-0">
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  transition={{ duration: 0.12 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Check size={12} className="text-emerald-500" />
                </motion.span>
              ) : (
                <motion.span
                  key="clipboard"
                  initial={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  transition={{ duration: 0.12 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Clipboard size={12} />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <span className="hidden sm:inline">Copy</span>
        </button>

        {/* Save/Update Button */}
        <button
          onClick={handleSave}
          aria-label={activeSavedId ? "Update README Save" : "Save README to Library"}
          className="group inline-flex h-7.5 items-center gap-1.5 rounded-md bg-linear-to-b to-zinc-800 from-zinc-900 hover:bg-linear-to-t hover:to-zinc-650 px-2.5 cursor-pointer font-mono text-xs  text-white active:scale-[0.98] transition-all duration-150 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.2)]"
        >
          <div className="relative size-3.5 flex items-center justify-center shrink-0">
            <AnimatePresence mode="wait" initial={false}>
              {saveSuccess ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  transition={{ duration: 0.12 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Check size={12} className="text-canvas-soft-2" />
                </motion.span>
              ) : (
                <motion.span
                  key="save"
                  initial={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  transition={{ duration: 0.12 }}
                  className="absolute inset-0 flex items-center justify-center group-hover:animate-pulse"
                >
                  <Save size={12} />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <span className="hidden sm:inline">{activeSavedId ? "Update Save" : "Save to Library"}</span>
          <span className="sm:hidden">{activeSavedId ? "Update" : "Save"}</span>
        </button>

        {/* Download Button */}
        <button
          onClick={downloadMarkdown}
          aria-label="Download README.md"
          className="inline-flex h-7.5 items-center gap-1.5 rounded border border-hairline cursor-pointer bg-canvas px-2.5 font-mono text-sm font-medium text-body hover:bg-canvas-soft-2 hover:text-ink active:scale-[0.99] transition-all duration-150"
        >
          <Download size={12} />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
    </div>
  );
}
