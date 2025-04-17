import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  env: {
    tournamentSystemEndpoint: "http://localhost",
    warnMapCheckEndpoint: "http://localhost",
    checkerEndpoints: "http://localhost|http://localhost:8080",
  }
};

export default nextConfig;
