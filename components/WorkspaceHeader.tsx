import { ArrowLeft, Check, Clipboard, Save, Download } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface WorkspaceHeaderProps {
  activeSavedId: string | null;
  copied: boolean;
  saveSuccess: boolean;
  copyMarkdown: () => void;
  handleSave: () => void;
  downloadMarkdown: () => void;
  handleCloseWorkspace: () => void;
}

export default function WorkspaceHeader({
  activeSavedId,
  copied,
  saveSuccess,
  copyMarkdown,
  handleSave,
  downloadMarkdown,
  handleCloseWorkspace,
}: WorkspaceHeaderProps) {
  return (
    <div className="sticky top-16 z-40 bg-canvas-soft/90 backdrop-blur-md py-4 border-b border-hairline/30 mb-6 flex items-center justify-between">
      <button
        onClick={handleCloseWorkspace}
        className="inline-flex items-center gap-1.5 text-xs text-body hover:text-ink font-mono transition-colors"
      >
        <ArrowLeft size={13} />
        <span className="hidden sm:inline">Back to Library</span>
        <span className="sm:hidden">Back</span>
      </button>

      <div className="flex items-center gap-2">
        {/* Copy Button */}
        <button
          onClick={copyMarkdown}
          aria-label="Copy Markdown"
          className="inline-flex h-7.5 items-center gap-1.5 rounded border border-hairline bg-canvas px-2.5 font-mono text-[11px] font-medium text-body hover:bg-canvas-soft-2 hover:text-ink active:scale-[0.99] transition-all duration-150"
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
          className="inline-flex h-7.5 items-center gap-1.5 rounded bg-ink px-2.5 font-mono text-[11px] font-medium text-canvas hover:bg-black/90 active:scale-[0.99] transition-all duration-150 relative overflow-hidden"
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
                  className="absolute inset-0 flex items-center justify-center"
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
          className="inline-flex h-7.5 items-center gap-1.5 rounded border border-hairline bg-canvas px-2.5 font-mono text-[11px] font-medium text-body hover:bg-canvas-soft-2 hover:text-ink active:scale-[0.99] transition-all duration-150"
        >
          <Download size={12} />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
    </div>
  );
}
