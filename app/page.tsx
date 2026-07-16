"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Code2, Download, LoaderCircle, Sparkles, Terminal } from "lucide-react";
import { canGenerate, generationLimit, readGenerationQuota, recordGeneration, type GenerationQuota } from "@/lib/quota";
import type { GenerateFailure, GenerateSuccess } from "@/lib/types";
import { getSavedReadmes, saveReadme, deleteReadme, type SavedReadme } from "@/lib/storage";

// Extracted modular components
import RepoInputForm from "@/components/RepoInputForm";
import SavedLibraryList from "@/components/SavedLibraryList";

const exampleUrl = "https://github.com/vercel/next.js";

function remainingGenerations(quota: GenerationQuota) {
  return Math.max(0, generationLimit - quota.count);
}

export default function Home() {
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const [repoUrl, setRepoUrl] = useState("");
  const [quota, setQuota] = useState<GenerationQuota>({ date: "", count: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedList, setSavedList] = useState<SavedReadme[]>([]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setQuota(readGenerationQuota());
      setSavedList(getSavedReadmes());
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  function handleDelete(id: string, event: React.MouseEvent) {
    event.stopPropagation();
    const updated = deleteReadme(id);
    setSavedList(updated);
  }

  function handleLoad(item: SavedReadme) {
    router.push(`/readme/${item.id}`);
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

      // Save to library and update quota
      const saved = saveReadme(result.analysis.fullName, result.markdown, result.analysis);
      setQuota(recordGeneration());

      // Redirect to the dynamic workspace route
      router.push(`/readme/${saved.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  const transition = useMemo(() => ({
    duration: reduceMotion ? 0 : 0.24,
    ease: [0.16, 1, 0.3, 1] as const, // ease-out-expo style curve
  }), [reduceMotion]);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <section id="top" className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
        {/* Premium multi-color mesh gradient backdrop */}
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(0,124,240,0.06),transparent_50%),radial-gradient(ellipse_at_top_right,rgba(121,40,202,0.06),transparent_50%),radial-gradient(ellipse_at_top_left,rgba(255,77,77,0.06),transparent_50%)] blur-3xl" />

        <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : 8, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={transition} className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-hairline/80 bg-canvas/60 px-3 py-1 font-mono text-xs text-body shadow-[0_1px_2px_rgba(0,0,0,0.02)] backdrop-blur-xs transition-all duration-200 hover:border-hairline-strong hover:bg-canvas">
            <span className="flex items-center gap-1 rounded-full bg-violet-soft/30 px-2 py-0.5 text-[10px] font-semibold text-violet uppercase tracking-wider">
              <Terminal size={10} className="stroke-[2.5]" />
              AI
            </span>
            <span className="text-body font-medium">README generator</span>
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl md:text-6xl sm:leading-[1.1] leading-[1.15]">
            Your project deserves a <span className="text-link font-bold">README</span> people can use.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-sm sm:text-lg leading-relaxed text-body">
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

        {!isGenerating && savedList.length > 0 && (
          <SavedLibraryList
            savedList={savedList}
            handleLoad={handleLoad}
            handleDelete={handleDelete}
            transition={transition}
            reduceMotion={reduceMotion}
          />
        )}

        {!isGenerating && (
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
    </main>
  );
}
