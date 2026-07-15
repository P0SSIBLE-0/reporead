import { GitBranch } from "lucide-react";
import type { RepositoryAnalysis } from "@/lib/types";

interface AnalysisStripProps {
  analysis: RepositoryAnalysis;
}

export default function AnalysisStrip({ analysis }: AnalysisStripProps) {
  const items = [
    analysis.framework.length ? analysis.framework.join(" · ") : null,
    analysis.languages.length ? analysis.languages.slice(0, 3).join(" · ") : null,
    analysis.license ? analysis.license : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-hairline bg-canvas-soft px-4.5 py-2.5 text-xs font-mono text-body">
      <a
        href={analysis.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-link cursor-pointer max-w-[240px] truncate sm:max-w-none transition-colors"
      >
        <GitBranch size={13} className="shrink-0" />
        {analysis.fullName}
      </a>
      {items.map((item) => (
        <span key={item} className="rounded-full bg-canvas-soft-2/80 px-2.5 py-0.5 text-[10px] font-medium border border-hairline shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.03)] text-body whitespace-nowrap">
          {item}
        </span>
      ))}
    </div>
  );
}
