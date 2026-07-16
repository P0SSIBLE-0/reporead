export type RepositoryReference = {
  owner: string;
  repo: string;
  url: string;
};

export type RepositoryAnalysis = {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  topics: string[];
  languages: string[];
  framework: string[];
  packageManager: string | null;
  dependencies: string[];
  scripts: Record<string, string>;
  license: string | null;
  projectStructure: string[];
};

export type GenerateSuccess = {
  markdown: string;
  analysis: RepositoryAnalysis;
};

export type GenerateFailure = {
  code:
  | "INVALID_URL"
  | "REPOSITORY_UNAVAILABLE"
  | "GITHUB_RATE_LIMIT"
  | "GITHUB_FAILURE"
  | "AI_CONFIGURATION"
  | "AI_FAILURE";
  message: string;
};
