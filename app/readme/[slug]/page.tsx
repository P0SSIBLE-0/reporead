"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { LoaderCircle, Terminal } from "lucide-react";
import { getSavedReadmes, saveReadme, type SavedReadme } from "@/lib/storage";

// Components
import WorkspaceHeader from "@/components/WorkspaceHeader";
import AnalysisStrip from "@/components/AnalysisStrip";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownPreview from "@/components/MarkdownPreview";

type WorkspaceTab = "editor" | "preview";

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

export default function ReadmeWorkspace() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const reduceMotion = useReducedMotion() ?? false;
  const [readme, setReadme] = useState<SavedReadme | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<WorkspaceTab>("preview");
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transition = useMemo(() => ({
    duration: reduceMotion ? 0 : 0.24,
    ease: [0.16, 1, 0.3, 1] as const,
  }), [reduceMotion]);

  useEffect(() => {
    if (!slug) return;
    try {
      const list = getSavedReadmes();
      const found = list.find(
        (item) => item.id === slug || slugify(item.fullName) === slug
      );
      if (found) {
        setReadme(found);
        setMarkdown(found.markdown);
        setActiveSavedId(found.id);
      } else {
        setError("We couldn't find the requested README in your library.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load README. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  function handleSave() {
    if (!readme) return;
    try {
      const saved = saveReadme(
        readme.fullName,
        markdown,
        readme.analysis,
        activeSavedId || undefined
      );
      setActiveSavedId(saved.id);
      setSaveSuccess(true);
      window.setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      setError("Failed to save changes. Please try again.");
    }
  }

  function handleRename(newName: string) {
    if (!readme) return;
    const updated = {
      ...readme,
      fullName: newName,
    };
    setReadme(updated);
    saveReadme(newName, markdown, readme.analysis, activeSavedId || undefined);
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy failed. Select the Markdown in the editor and copy it manually.");
    }
  }

  function downloadMarkdown() {
    if (!readme) return;
    const file = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const href = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = href;
    const fileName = readme.analysis?.name || readme.fullName.toLowerCase().replace(/[^a-z0-9]/g, "-") || "README";
    link.download = `${fileName}.md`;
    link.click();
    URL.revokeObjectURL(href);
  }

  function handleCloseWorkspace() {
    router.push("/");
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <div className="relative mx-auto max-w-[1440px] px-2 md:px-5 pt-2 pb-8 sm:px-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[400px] flex-col items-center justify-center gap-3"
            >
              <LoaderCircle className="animate-spin text-mute" size={24} />
              <p className="text-sm text-mute font-mono">Loading README...</p>
            </motion.div>
          ) : error || !readme ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={transition}
              className="mx-auto max-w-md py-16 text-center"
            >
              <div className="rounded-lg border border-hairline bg-canvas p-8 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-violet-soft/20 text-violet mb-4">
                  <Terminal size={20} className="stroke-2" />
                </span>
                <h2 className="text-lg font-semibold text-ink">README Not Found</h2>
                <p className="mt-2 text-sm text-body leading-relaxed">
                  {error || "This README doesn't exist or may have been deleted from your library."}
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-ink px-4 font-sans text-sm font-medium text-canvas hover:bg-black/90 transition-colors"
                >
                  Back to Library
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.section
              key="workspace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
              className="mx-auto mb-16"
            >
              <WorkspaceHeader
                activeSavedId={activeSavedId}
                copied={copied}
                saveSuccess={saveSuccess}
                title={readme.fullName}
                isCustom={!readme.analysis}
                onRename={handleRename}
                copyMarkdown={copyMarkdown}
                handleSave={handleSave}
                downloadMarkdown={downloadMarkdown}
                handleCloseWorkspace={handleCloseWorkspace}
              />
              {error && (
                <div className="mb-4 rounded-lg bg-error-soft/30 border border-error/20 p-3 text-xs text-error-deep font-mono">
                  {error}
                </div>
              )}
              <div className="overflow-hidden rounded-lg bg-canvas border border-hairline shadow-[0_1px_2px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)]">
                {readme.analysis && <AnalysisStrip analysis={readme.analysis} />}
                <div className="border-b border-hairline bg-canvas-soft/50 px-4 pt-3 md:hidden">
                  <div role="tablist" aria-label="README workspace views" className="flex gap-4">
                    {(["editor", "preview"] as WorkspaceTab[]).map((item) => (
                      <button
                        key={item}
                        role="tab"
                        aria-selected={tab === item}
                        onClick={() => setTab(item)}
                        className={`border-b-2 px-1 pb-3 text-xs font-semibold capitalize transition-colors duration-150 ${tab === item ? "border-ink text-ink" : "border-transparent text-mute"
                          }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid min-h-[620px] grid-cols-1 md:grid-cols-2">
                  <MarkdownEditor markdown={markdown} setMarkdown={setMarkdown} tab={tab} />
                  <MarkdownPreview markdown={markdown} tab={tab} />
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
