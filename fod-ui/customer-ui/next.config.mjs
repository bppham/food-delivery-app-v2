import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    outputFileTracingRoot: path.resolve(import.meta.dirname),
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**",
        },
      ],
    },
  };
  
  export default nextConfig;
  