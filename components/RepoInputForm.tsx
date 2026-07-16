import { GitBranch, LoaderCircle, ArrowRight, TriangleAlert } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface RepoInputFormProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  isGenerating: boolean;
  limitReached: boolean;
  remaining: number;
  generationLimit: number;
  error: string | null;
  setError: (err: string | null) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  exampleUrl: string;
}

export default function RepoInputForm({
  repoUrl,
  setRepoUrl,
  isGenerating,
  limitReached,
  remaining,
  generationLimit,
  error,
  setError,
  onSubmit,
  exampleUrl,
}: RepoInputFormProps) {
  const reduceMotion = useReducedMotion();

  return (
    <form onSubmit={onSubmit} className="relative mx-auto mt-10 max-w-2xl">
      <label htmlFor="repo-url" className="sr-only">Public GitHub repository URL</label>
      <div className={`relative group overflow-hidden rounded-[7px] p-[1.75px] transition-all duration-300 ${error ? "bg-error-deep/40" : "bg-hairline hover:bg-hairline-strong focus-within:bg-hairline-strong"} shadow-[0_1px_2px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.02)]`}>
        {!error && (
          <motion.span
            className="absolute inset-[-1000%] bg-[conic-gradient(from_0deg,#7928ca_0deg,#ff0080_120deg,#0070f3_240deg,#7928ca_360deg)] opacity-25 group-hover:opacity-60 group-focus-within:opacity-90 transition-opacity duration-300"
            animate={reduceMotion ? {} : { rotate: [0, 360] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
        <div className={`relative flex flex-col gap-3 rounded-md bg-canvas p-2 sm:flex-row sm:items-center ${error ? "ring-1 ring-error-soft/30" : ""}`}>
          <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
            <GitBranch className="shrink-0 text-mute" size={18} />
            <input
              id="repo-url"
              value={repoUrl}
              onChange={(event) => {
                setRepoUrl(event.target.value);
                setError(null);
              }}
              placeholder="https://github.com/vercel/next.js"
              autoComplete="url"
              inputMode="url"
              className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-mute"
            />
          </div>
          <button
            type="submit"
            disabled={isGenerating || limitReached}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-canvas hover:bg-black/90 active:scale-[0.99] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:bg-hairline-strong/20 disabled:text-mute overflow-hidden min-w-[135px]"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isGenerating ? (
                <motion.span
                  key="analyzing"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2"
                >
                  <LoaderCircle className="animate-spin text-mute" size={16} />
                  <span>Analyzing</span>
                </motion.span>
              ) : (
                <motion.span
                  key="generate"
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2"
                >
                  <span>Generate README</span>
                  <ArrowRight size={16} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 px-1 font-mono text-xs">
        <button
          type="button"
          onClick={() => setRepoUrl(exampleUrl)}
          className="text-body transition hover:text-ink flex items-center gap-1 hover:underline decoration-hairline-strong underline-offset-4"
        >
          Try with vercel/next.js
        </button>
        <span className={limitReached ? "font-medium text-error" : "text-mute"}>
          {limitReached ? "Daily limit reached" : `${remaining} of ${generationLimit} generations left today`}
        </span>
      </div>
      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2.5 rounded-lg border border-error-soft bg-error-soft/10 px-4 py-3 text-sm leading-5 text-error-deep">
          <TriangleAlert className="mt-0.5 shrink-0" size={16} />
          {error}
        </p>
      )}
    </form>
  );
}
