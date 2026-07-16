"use client";

import { useRouter } from "next/navigation";
import { FileText, LockKeyhole, Plus } from "lucide-react";
import { saveReadme } from "@/lib/storage";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();

  function handleCreateCustom() {
    const initialMarkdown = `# Untitled Document\n\nStart writing your markdown here...\n`;
    const saved = saveReadme("Untitled Document", initialMarkdown, undefined);
    router.push(`/readme/${saved.id}`);
  }

  return (
    <header className="border-b border-hairline bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <a href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="RepoRead home">
          <span className="grid size-9 md:size-10 place-items-center">
            <Image src={'/logo.svg'} alt="RepoRead" width={50} height={50} />
          </span>
          <span className="text-ink font-sans font-semibold text-lg tracking-tight">RepoRead</span>
        </a>

        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-2 font-mono text-xs text-mute sm:flex">
            <LockKeyhole size={12} />Public repositories only
          </span>
          <button
            onClick={handleCreateCustom}
            className="inline-flex h-8 group items-center gap-1.5 rounded-md border border-zinc-950/80 bg-linear-to-b to-zinc-800 from-zinc-900 hover:bg-linear-to-t px-3 text-xs text-white hover:to-zinc-650  transition-all duration-150 active:scale-[0.98] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.2)]"
          >
            <Plus className="group-hover:rotate-90 transition-transform duration-200" size={13} />
            <span>Create</span>
          </button>
        </div>
      </div>
    </header>
  );
}