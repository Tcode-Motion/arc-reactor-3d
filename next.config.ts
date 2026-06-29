import type { NextConfig } from "next";

// GitHub repo name — must exactly match your repository name on GitHub
const repoName = 'arc-reactor-3d';

const nextConfig: NextConfig = {
  output: 'export',           // Static HTML export for GitHub Pages
  images: {
    unoptimized: true,        // Required for static export (no Image Optimization API)
  },
  // basePath and assetPrefix are ONLY applied during production builds.
  // In development (npm run dev) they are omitted so localhost works normally.
  basePath:    process.env.NEXT_PUBLIC_GITHUB_PAGES === '1' ? `/${repoName}` : undefined,
  assetPrefix: process.env.NEXT_PUBLIC_GITHUB_PAGES === '1' ? `/${repoName}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_GITHUB_PAGES === '1' ? `/${repoName}` : '',
  },
  // Trailing slash ensures all routes resolve correctly on GitHub Pages
  trailingSlash: true,
};

export default nextConfig;