import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the workspace root to this project. Without it, Turbopack walks up
  // looking for the nearest lockfile and finds an unrelated, package.json-less
  // package-lock.json in the parent Downloads folder, which it then (wrongly)
  // treats as the monorepo root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
