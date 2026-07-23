import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export interface ScanOptions {
  filterModifiedOnly?: boolean;
  baseCommit?: string;
  extensions?: string[];
}

const DEFAULT_EXTENSIONS = [".md", ".markdown", ".mdx"];

/**
 * Scans a content directory recursively for markdown articles.
 * Optionally filters by files modified/added in the latest git commit.
 */
export async function scanContentDirectory(
  contentDir: string,
  options: ScanOptions = {}
): Promise<string[]> {
  const resolvedDir = path.resolve(process.cwd(), contentDir);

  if (!fs.existsSync(resolvedDir)) {
    throw new Error(`Content directory does not exist: ${resolvedDir}`);
  }

  const extensions = options.extensions || DEFAULT_EXTENSIONS;
  const allFiles = findFilesRecursive(resolvedDir, extensions);

  if (!options.filterModifiedOnly) {
    return allFiles.sort();
  }

  // If filterModifiedOnly is requested, query git
  try {
    const gitChangedFiles = getGitChangedFiles(resolvedDir);
    if (gitChangedFiles.length > 0) {
      const changedSet = new Set(gitChangedFiles.map((f) => path.resolve(f)));
      const filtered = allFiles.filter((file) => changedSet.has(path.resolve(file)));
      // If matches found, return them
      if (filtered.length > 0) {
        return filtered.sort();
      }
    }
  } catch (err) {
    console.warn("⚠️ Git diff query failed or not in a git repo. Falling back to all files.");
  }

  return allFiles.sort();
}

/**
 * Recursively retrieves all files matching target extensions.
 */
function findFilesRecursive(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip hidden directories (like .git, .github) and node_modules
      if (entry.name.startsWith(".") || entry.name === "node_modules") {
        continue;
      }
      results.push(...findFilesRecursive(fullPath, extensions));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

/**
 * Queries git for added, copied, modified, or renamed markdown files.
 */
function getGitChangedFiles(rootDir: string): string[] {
  try {
    // 1. Try checking against HEAD~1 (for push event in CI)
    const diffOutput = execSync("git diff --name-only --diff-filter=ACMR HEAD~1 HEAD", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });

    const lines = diffOutput
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length > 0) {
      return lines;
    }
  } catch {
    // Fallback: check uncommitted/staged files
  }

  try {
    const statusOutput = execSync("git status --porcelain", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });

    return statusOutput
      .split("\n")
      .map((l) => l.trim().slice(3).trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}
