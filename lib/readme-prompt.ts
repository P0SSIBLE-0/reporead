import type { RepositoryAnalysis } from "@/lib/types";

export function createReadmePrompt(analysis: RepositoryAnalysis) {
  return `You are an expert open-source documentation writer.

Task:
Generate a high-quality, comprehensive, and professional README.md for the repository based on the provided repository facts.

Goal:
Create a complete, polished README.md that developers can immediately commit. Avoid empty placeholders, unfinished sections, or notes like "Not enough information available." Instead, construct standard setup commands and clear descriptions derived from the repo signals.

Instructions & Best Practices:
1. **Title & Description**: Use a single clean H1 for the project name (sentence-cased or branded properly) and write a descriptive 2-3 sentence overview explaining what the project is based on its name, dependencies, and structure (e.g., describing client-server frameworks).
2. **Features**: List 3-5 core features or capabilities inferred logically from the project structure, scripts, and dependencies (e.g. Docker configuration, API routing, server middleware, single-page application UI, database seeding).
3. **Tech Stack**: List languages, frameworks, and dev tools (TypeScript, JavaScript, Next.js, Docker, etc.) used in the repository.
4. **Getting Started**:
   - **Prerequisites**: Detail any required runtimes (e.g. Node.js, Docker).
   - **Installation**: Provide standard installation instructions based on the package manager (e.g. \`npm install\` or \`yarn install\`).
   - **Running the Application**: Provide commands to run development servers using the verified scripts (e.g., \`npm run dev\`, \`npm run start\`). If there is a docker-compose.yml file, include a command to run docker compose.
5. **Project Structure**: Present the verified project structure folders as a clean tree or list to help developers navigate the codebase.
6. **Scripts**:
   - Render the scripts in a Markdown table with the exact command keys and a short description of what they do.
7. **Environment Variables**:
   - If env templates (like .env.example) exist, mention copying them to configure variables.
8. **License**:
   - If a license is specified in facts, list it. Otherwise, mention that the project is licensed under standard open-source terms or refer to check the LICENSE file.

Hard Rules:
- Return ONLY valid Markdown.
- Do not wrap the final output in code fences (e.g., \`\`\`markdown ... \`\`\`).
- Do not mention AI, GPT, or say you are generating this.
- Do not output thinking, reasoning, notes, or labels.
- Make the documentation sound authoritative and developer-ready.

Verified repository facts:
${JSON.stringify(analysis, null, 2)}`;
}

export function normalizeGeneratedMarkdown(markdown: string) {
  return markdown.trim().replace(/^```(?:markdown|md)?\s*/i, "").replace(/\s*```$/, "").trim();
}