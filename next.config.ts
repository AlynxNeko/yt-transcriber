import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Keep your existing Next.js settings
  webpack: (config, { isServer }) => {
    // Only apply this configuration on the client side (browser)
    if (!isServer) {
      // Correct Webpack fallback syntax (remains important for other static imports)
      config.resolve.fallback = {
        ...config.resolve.fallback, // Keep any existing fallbacks
        fs: false,
        path: false,
        // Add any other Node.js built-in modules that might cause issues
        // e.g., 'crypto', 'stream', 'buffer', 'util', 'http', 'https', 'url', 'assert', 'zlib'
        // For pptxgenjs, 'fs' and 'https' are the primary culprits from your trace.
        // It's often safer to explicitly set common ones to false.
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        http: false,
        https: false,
        url: false,
        assert: false,
        zlib: false,
      };

      // Crucially, tell Webpack to *ignore* these dynamic Node.js imports
      // when building the client bundle. This prevents the "UnhandledSchemeError".
      config.externals.push({
        'node:fs': 'commonjs node:fs',
        'node:https': 'commonjs node:https',
        // Add any other specific 'node:' prefixed modules if they appear in future errors
      });
    }

    return config;
  },
};

export default nextConfig;
