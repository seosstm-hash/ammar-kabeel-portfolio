import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGitHubPages ? "/ammar-kabeel-portfolio" : "";

const nextConfig: NextConfig = isGitHubPages
  ? {
      output: "export",
      basePath,
      assetPrefix: basePath,
      trailingSlash: true,
      images: { unoptimized: true },
      typescript: { tsconfigPath: "tsconfig.pages.json" },
    }
  : {};

export default nextConfig;
