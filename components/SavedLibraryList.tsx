import { GitBranch, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import type { SavedReadme } from "@/lib/storage";

interface SavedLibraryListProps {
  savedList: SavedReadme[];
  handleLoad: (item: SavedReadme) => void;
  handleDelete: (id: string, e: React.MouseEvent) => void;
  transition: any;
  reduceMotion: boolean;
}

export default function SavedLibraryList({
  savedList,
  handleLoad,
  handleDelete,
  transition,
  reduceMotion,
}: SavedLibraryListProps) {
  return (
    <div className="mx-auto mt-16 max-w-4xl border-t border-hairline pt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-ink tracking-tight flex items-center gap-2">
          <span>Your Library</span>
          <span className="rounded-full bg-canvas-soft-2 px-2 py-0.5 text-[10px] font-semibold text-body border border-hairline shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.03)]">{savedList.length}</span>
        </h2>
        <span className="text-xs text-mute font-mono">Click to edit or preview</span>
      </div>
      <div className="flex flex-col gap-3">
        {savedList.map((item, index) => {
          const badgeItems = [
            item.analysis.framework[0] || null,
            item.analysis.languages[0] || null,
            item.analysis.license || null,
          ].filter(Boolean);

          return (
            <motion.div
              key={item.id}
              onClick={() => handleLoad(item)}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.04 }}
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-hairline bg-canvas p-4.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:border-hairline-strong hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all duration-200 cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="inline-flex items-center gap-1.5 font-sans font-semibold text-ink text-sm group-hover:text-link transition-colors">
                    <GitBranch size={14} className="text-mute group-hover:text-link transition-colors" />
                    {item.fullName}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {badgeItems.map((badge) => (
                      <span key={badge} className="rounded px-1.5 py-0.5 text-[10px] font-medium text-body border border-hairline bg-canvas-soft-2/80 shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.03)]">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
                {item.analysis.description && (
                  <p className="mt-1 text-xs text-body line-clamp-1 leading-relaxed">
                    {item.analysis.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-hairline/60 sm:border-0 pt-2.5 sm:pt-0 shrink-0">
                <span className="text-[10px] text-mute font-mono">
                  {new Date(item.savedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  title="Delete README"
                  className="p-2 -mr-2 rounded-md text-mute hover:text-error hover:bg-error-soft/10 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
