import { GoogleGenAI } from "@google/genai";
import { analyzeRepository, GitHubApiError, parseGitHubRepositoryUrl } from "@/lib/github";
import { createReadmePrompt, normalizeGeneratedMarkdown } from "@/lib/readme-prompt";
import type { GenerateFailure } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function failure(code: GenerateFailure["code"], message: string, status: number) {
  return Response.json({ code, message } satisfies GenerateFailure, { status });
}

export async function POST(request: Request) {
  let body: { repoUrl?: unknown };
  try {
    body = await request.json();
  } catch {
    return failure("INVALID_URL", "Enter a valid public GitHub repository URL.", 400);
  }

  const reference = typeof body.repoUrl === "string" ? parseGitHubRepositoryUrl(body.repoUrl) : null;
  if (!reference) return failure("INVALID_URL", "Enter a canonical public GitHub repository URL.", 400);
  if (!process.env.GEMINI_API_KEY) {
    return failure("AI_CONFIGURATION", "README generation is not configured yet. Add GEMINI_API_KEY and try again.", 500);
  }

  try {
    const analysis = await analyzeRepository(reference);
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      contents: createReadmePrompt(analysis),
      config: { temperature: 0.2 },
    });
    const markdown = normalizeGeneratedMarkdown(response.text ?? "");
    if (!markdown) throw new Error("Gemini returned no Markdown");
    return Response.json({ markdown, analysis });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      if (error.kind === "unavailable") {
        return failure("REPOSITORY_UNAVAILABLE", "We couldn't access this repository. It may be private or unavailable.", 404);
      }
      if (error.kind === "rate_limit") return failure("GITHUB_RATE_LIMIT", "GitHub is rate limiting requests. Please try again shortly.", 429);
      return failure("GITHUB_FAILURE", "GitHub could not analyze this repository right now. Please try again.", 502);
    }
    console.error("README generation failed", error);
    return failure("AI_FAILURE", "README generation failed. Please try again in a moment.", 502);
  }
}
