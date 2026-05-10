import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "path";

// Load repo-root `.env` / `.env.local` so one file can serve backend + frontend.
const repoRoot = path.join(__dirname, "..");
loadEnvConfig(repoRoot);

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
