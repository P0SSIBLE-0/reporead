import type { RepositoryAnalysis, RepositoryReference } from "@/lib/types";

const githubApi = "https://api.github.com";
const rootManifestFiles = [
  "package.json",
  "pyproject.toml",
  "requirements.txt",
  "Pipfile",
  "go.mod",
  "Cargo.toml",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "composer.json",
  "Gemfile",
];
const licenseFiles = ["LICENSE", "LICENSE.md", "LICENSE.txt"];

type GitHubRepository = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics?: string[];
  default_branch: string;
  license?: { name?: string | null; spdx_id?: string | null } | null;
};

type TreeEntry = { path: string; type: "blob" | "tree"; size?: number };
type TreeResponse = { tree: TreeEntry[]; truncated: boolean };

export class GitHubApiError extends Error {
  constructor(
    public readonly kind: "unavailable" | "rate_limit" | "failure",
    message: string,
  ) {
    super(message);
  }
}

export function parseGitHubRepositoryUrl(value: string): RepositoryReference | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !["github.com", "www.github.com"].includes(url.hostname)) return null;
    if (url.search || url.hash) return null;

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length !== 2) return null;
    const [owner, rawRepo] = segments;
    const repo = rawRepo.endsWith(".git") ? rawRepo.slice(0, -4) : rawRepo;
    const validPart = /^[A-Za-z0-9_.-]+$/;
    if (!owner || !repo || !validPart.test(owner) || !validPart.test(repo)) return null;

    return { owner, repo, url: `https://github.com/${owner}/${repo}` };
  } catch {
    return null;
  }
}

function headers() {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "RepoRead",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function githubFetch(path: string, init?: RequestInit) {
  const response = await fetch(`${githubApi}${path}`, {
    ...init,
    headers: { ...headers(), ...init?.headers },
    next: { revalidate: 0 },
  });
  if (response.status === 404) {
    throw new GitHubApiError("unavailable", "This repository is private, unavailable, or does not exist.");
  }
  if (response.status === 403 || response.status === 429) {
    throw new GitHubApiError("rate_limit", "GitHub is temporarily rate limiting repository analysis.");
  }
  if (!response.ok) {
    throw new GitHubApiError("failure", "GitHub could not retrieve this repository right now.");
  }
  return response;
}

function parsePackageJson(contents: string) {
  try {
    const pkg = JSON.parse(contents) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      scripts?: Record<string, string>;
    };
    const dependencies = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})];
    const frameworkMap: Record<string, string> = {
      next: "Next.js",
      react: "React",
      vue: "Vue",
      "@angular/core": "Angular",
      svelte: "Svelte",
      astro: "Astro",
      express: "Express",
      nestjs: "NestJS",
    };
    return {
      dependencies,
      scripts: pkg.scripts ?? {},
      frameworks: dependencies.flatMap((name) => (frameworkMap[name] ? [frameworkMap[name]] : [])),
    };
  } catch {
    return { dependencies: [], scripts: {}, frameworks: [] };
  }
}

function parseTextManifest(path: string, contents: string): { dependencies: string[]; frameworks: string[] } {
  const firstMatch = (expression: RegExp) => contents.match(expression)?.[1]?.trim();
  if (path === "go.mod") {
    const moduleName = firstMatch(/^module\s+(.+)$/m);
    return { dependencies: moduleName ? [moduleName] : [], frameworks: ["Go"] };
  }
  if (path === "Cargo.toml") {
    const packageName = firstMatch(/^name\s*=\s*["'](.+?)["']/m);
    return { dependencies: packageName ? [packageName] : [], frameworks: ["Rust"] };
  }
  if (["requirements.txt", "Pipfile", "pyproject.toml"].includes(path)) {
    return {
      dependencies: contents
        .split("\n")
        .map((line) => line.trim().match(/^([A-Za-z0-9_.-]+)/)?.[1])
        .filter((name): name is string => Boolean(name))
        .slice(0, 40),
      frameworks: ["Python"],
    };
  }
  if (path === "Gemfile") {
    return { dependencies: [...contents.matchAll(/gem\s+["']([^"']+)/g)].map((match) => match[1]).slice(0, 40), frameworks: ["Ruby"] };
  }
  if (["pom.xml", "build.gradle", "build.gradle.kts"].includes(path)) return { dependencies: [], frameworks: ["Java"] };
  return { dependencies: [], frameworks: [] };
}

export function extractManifestSignals(manifests: Array<readonly [string, string]>) {
  const dependencies = new Set<string>();
  const frameworks = new Set<string>();
  const scripts: Record<string, string> = {};
  for (const [path, contents] of manifests) {
    if (path === "package.json") {
      const parsed = parsePackageJson(contents);
      parsed.dependencies.forEach((name) => dependencies.add(name));
      parsed.frameworks.forEach((name) => frameworks.add(name));
      Object.assign(scripts, parsed.scripts);
    } else if (path === "composer.json") {
      const parsed = parsePackageJson(contents);
      parsed.dependencies.forEach((name) => dependencies.add(name));
      frameworks.add("PHP");
    } else {
      const parsed = parseTextManifest(path, contents);
      parsed.dependencies.forEach((name) => dependencies.add(name));
      parsed.frameworks.forEach((name) => frameworks.add(name));
    }
  }
  return { dependencies: [...dependencies].slice(0, 60), frameworks: [...frameworks].slice(0, 8), scripts: Object.fromEntries(Object.entries(scripts).slice(0, 20)) };
}

function packageManager(paths: Set<string>) {
  if (paths.has("pnpm-lock.yaml")) return "pnpm";
  if (paths.has("yarn.lock")) return "Yarn";
  if (paths.has("package-lock.json")) return "npm";
  if (paths.has("bun.lockb") || paths.has("bun.lock")) return "Bun";
  if (paths.has("poetry.lock")) return "Poetry";
  if (paths.has("Pipfile.lock")) return "Pipenv";
  if (paths.has("requirements.txt")) return "pip";
  if (paths.has("Cargo.lock")) return "Cargo";
  if (paths.has("go.mod")) return "Go modules";
  if (paths.has("composer.lock")) return "Composer";
  if (paths.has("Gemfile.lock")) return "Bundler";
  return null;
}

function structureSummary(entries: TreeEntry[]) {
  const paths = entries
    .filter((entry) => !entry.path.startsWith(".git/") && entry.path.split("/").length <= 3)
    .map((entry) => entry.path)
    .slice(0, 80);
  return Array.from(new Set(paths));
}

export async function analyzeRepository(reference: RepositoryReference): Promise<RepositoryAnalysis> {
  const repositoryResponse = await githubFetch(`/repos/${reference.owner}/${reference.repo}`);
  const repository = (await repositoryResponse.json()) as GitHubRepository;
  const [languagesResponse, treeResponse] = await Promise.all([
    githubFetch(`/repos/${reference.owner}/${reference.repo}/languages`),
    githubFetch(`/repos/${reference.owner}/${reference.repo}/git/trees/${encodeURIComponent(repository.default_branch)}?recursive=1`),
  ]);
  const languages = Object.keys((await languagesResponse.json()) as Record<string, number>);
  const tree = (await treeResponse.json()) as TreeResponse;
  const filePaths = new Set(tree.tree.filter((entry) => entry.type === "blob").map((entry) => entry.path));
  const rootFiles = rootManifestFiles.filter((path) => filePaths.has(path));
  const manifestResponses = await Promise.all(
    rootFiles.map(async (path) => {
      const response = await githubFetch(`/repos/${reference.owner}/${reference.repo}/contents/${encodeURIComponent(path)}`, {
        headers: { Accept: "application/vnd.github.raw+json" },
      });
      return [path, (await response.text()).slice(0, 12_000)] as const;
    }),
  );

  const signals = extractManifestSignals(manifestResponses);
  const frameworks = signals.frameworks.length ? signals.frameworks : languages.slice(0, 1);

  const licensePath = licenseFiles.find((path) => filePaths.has(path));
  const license = repository.license?.spdx_id && repository.license.spdx_id !== "NOASSERTION"
    ? repository.license.spdx_id
    : repository.license?.name ?? (licensePath ? licensePath : null);

  return {
    name: repository.name,
    fullName: repository.full_name,
    description: repository.description,
    url: repository.html_url,
    homepage: repository.homepage,
    topics: repository.topics ?? [],
    languages: languages.slice(0, 8),
    framework: frameworks,
    packageManager: packageManager(filePaths),
    dependencies: signals.dependencies,
    scripts: signals.scripts,
    license,
    projectStructure: structureSummary(tree.tree).concat(tree.truncated ? ["… repository tree truncated by GitHub"] : []),
  };
}
