"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Code2, Download, FileText, LoaderCircle, LockKeyhole, Sparkles } from "lucide-react";
import { canGenerate, generationLimit, readGenerationQuota, recordGeneration, type GenerationQuota } from "@/lib/quota";
import type { GenerateFailure, GenerateSuccess, RepositoryAnalysis } from "@/lib/types";
import { getSavedReadmes, saveReadme, deleteReadme, type SavedReadme } from "@/lib/storage";

// Extracted modular components
import AnalysisStrip from "@/components/AnalysisStrip";
import RepoInputForm from "@/components/RepoInputForm";
import SavedLibraryList from "@/components/SavedLibraryList";
import WorkspaceHeader from "@/components/WorkspaceHeader";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownPreview from "@/components/MarkdownPreview";

type WorkspaceTab = "editor" | "preview";

const exampleUrl = "https://github.com/vercel/next.js";

function remainingGenerations(quota: GenerationQuota) {
  return Math.max(0, generationLimit - quota.count);
}

export default function Home() {
  const reduceMotion = useReducedMotion() ?? false;
  const [repoUrl, setRepoUrl] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [analysis, setAnalysis] = useState<RepositoryAnalysis | null>(null);
  const [quota, setQuota] = useState<GenerationQuota>({ date: "", count: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<WorkspaceTab>("editor");

  const [savedList, setSavedList] = useState<SavedReadme[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setQuota(readGenerationQuota());
      setSavedList(getSavedReadmes());
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  function handleSave() {
    if (!analysis) return;
    const saved = saveReadme(analysis.fullName, markdown, analysis, activeSavedId || undefined);
    setActiveSavedId(saved.id);
    setSavedList(getSavedReadmes());
    setSaveSuccess(true);
    window.setTimeout(() => setSaveSuccess(false), 2000);
  }

  function handleDelete(id: string, event: React.MouseEvent) {
    event.stopPropagation();
    const updated = deleteReadme(id);
    setSavedList(updated);
    if (activeSavedId === id) {
      setActiveSavedId(null);
      setAnalysis(null);
      setMarkdown("");
    }
  }

  function handleLoad(item: SavedReadme) {
    setAnalysis(item.analysis);
    setMarkdown(item.markdown);
    setRepoUrl(item.analysis.url);
    setActiveSavedId(item.id);
    setTab("preview");
    setError(null);
  }

  function handleCloseWorkspace() {
    setAnalysis(null);
    setMarkdown("");
    setActiveSavedId(null);
    setRepoUrl("");
    setError(null);
  }

  const limitReached = quota.date !== "" && !canGenerate(quota);
  const remaining = useMemo(() => remainingGenerations(quota), [quota]);


  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isGenerating) return;
    const currentQuota = readGenerationQuota();
    setQuota(currentQuota);
    if (!canGenerate(currentQuota)) {
      setError("You've reached today's generation limit. Please come back tomorrow.");
      return;
    }
    if (!repoUrl.trim()) {
      setError("Paste a public GitHub repository URL to get started.");
      return;
    }

    setError(null);
    setCopied(false);
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });
      const result = (await response.json()) as GenerateSuccess | GenerateFailure;
      if (!response.ok) throw new Error("message" in result ? result.message : "Generation failed. Please try again.");
      if (!("markdown" in result)) throw new Error("Generation returned an invalid response. Please try again.");
      setMarkdown(result.markdown);
      setAnalysis(result.analysis);
      setTab("preview");
      setQuota(recordGeneration());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
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
    const file = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const href = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = href;
    link.download = "README.md";
    link.click();
    URL.revokeObjectURL(href);
  }

  const transition = useMemo(() => ({
    duration: reduceMotion ? 0 : 0.24,
    ease: [0.16, 1, 0.3, 1] as const, // ease-out-expo style curve
  }), [reduceMotion]);


  return (
    <main className="min-h-screen overflow-x-hidden bg-canvas-soft text-ink font-sans">
      <header className="border-b border-hairline bg-canvas/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="RepoRead home">
            <span className="grid size-8 place-items-center rounded-lg bg-ink text-canvas shadow-sm"><FileText size={15} /></span>
            <span className="text-ink font-sans font-semibold text-lg tracking-tight">RepoRead</span>
          </a>
          <span className="hidden items-center gap-2 font-mono text-xs text-mute sm:flex"><LockKeyhole size={12} />Public repositories only</span>
        </div>
      </header>

      <section id="top" className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
        {/* Premium multi-color mesh gradient backdrop */}
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(0,124,240,0.06),transparent_50%),radial-gradient(ellipse_at_top_right,rgba(121,40,202,0.06),transparent_50%),radial-gradient(ellipse_at_top_left,rgba(255,77,77,0.06),transparent_50%)] blur-3xl" />

        <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={transition} className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-canvas px-3.5 py-1 font-mono text-xs text-body shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <Sparkles size={13} className="text-violet-500 animate-pulse" />
            <span>AI README generator</span>
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl md:text-6xl sm:leading-[1.1] leading-[1.15]">
            Your project deserves a <span className="text-link font-bold">README</span> people can use.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base sm:text-lg leading-relaxed text-body">
            RepoRead inspects the essential signals in a public GitHub repository and creates a polished, editable README in seconds.
          </p>
        </motion.div>

        <RepoInputForm
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          isGenerating={isGenerating}
          limitReached={limitReached}
          remaining={remaining}
          generationLimit={generationLimit}
          error={error}
          setError={setError}
          onSubmit={generate}
          exampleUrl={exampleUrl}
        />

        {!analysis && !isGenerating && savedList.length > 0 && (
          <SavedLibraryList
            savedList={savedList}
            handleLoad={handleLoad}
            handleDelete={handleDelete}
            transition={transition}
            reduceMotion={reduceMotion}
          />
        )}

        {!analysis && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.1 }}
            className="relative mx-auto mt-20 grid max-w-4xl gap-6 border-t border-hairline pt-12 sm:grid-cols-3"
          >
            {[
              [Code2, "Lean analysis", "Metadata, manifests, scripts, and project structure—not your source code."],
              [Sparkles, "Useful structure", "Sections are grounded in the signals your repository actually provides."],
              [Download, "Yours to refine", "Edit the Markdown, copy it, or download a ready-to-commit README.md."],
            ].map(([Icon, title, detail]) => {
              const FeatureIcon = Icon as typeof Code2;
              return (
                <div key={title as string} className="group flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-canvas text-ink border border-hairline group-hover:border-hairline-strong group-hover:text-link transition-all duration-200">
                    <FeatureIcon size={16} className="group-hover:scale-105 transition-transform duration-200" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-ink text-sm sm:text-base leading-tight group-hover:text-ink transition-colors duration-200">{title as string}</h2>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-body">{detail as string}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </section>

      <AnimatePresence mode="popLayout">
        {isGenerating && (
          <motion.section
            key="generating"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={transition}
            aria-live="polite"
            className="mx-auto mb-20 max-w-3xl px-5 sm:px-8"
          >
            <div className="rounded-lg bg-ink border border-ink p-5 text-canvas shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-3.5">
                <LoaderCircle className="animate-spin text-canvas-soft-2" size={18} />
                <div>
                  <p className="font-medium text-sm sm:text-base">Reading the essential project signals</p>
                  <p className="mt-1 text-xs sm:text-sm text-mute leading-relaxed">Repository metadata, manifests, languages, and scripts are being prepared for the README.</p>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {analysis && (
          <motion.section
            key="analysis"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={transition}
            className="mx-auto mb-16 max-w-7xl px-3 md:px-5 sm:px-8"
          >
            <WorkspaceHeader
              activeSavedId={activeSavedId}
              copied={copied}
              saveSuccess={saveSuccess}
              copyMarkdown={copyMarkdown}
              handleSave={handleSave}
              downloadMarkdown={downloadMarkdown}
              handleCloseWorkspace={handleCloseWorkspace}
            />
            <div className="overflow-hidden rounded-lg bg-canvas border border-hairline shadow-[0_1px_2px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)]">
              <AnalysisStrip analysis={analysis} />
              <div className="border-b border-hairline bg-canvas-soft/50 px-4 pt-3 md:hidden">
                <div role="tablist" aria-label="README workspace views" className="flex gap-4">
                  {(["editor", "preview"] as WorkspaceTab[]).map((item) => (
                    <button key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`border-b-2 px-1 pb-3 text-xs font-semibold capitalize transition-colors duration-150 ${tab === item ? "border-ink text-ink" : "border-transparent text-mute"}`}>
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
    </main>
  );
}
