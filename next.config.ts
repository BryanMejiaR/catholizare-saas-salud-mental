import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd()
};

export default withSentryConfig(nextConfig, {
  org: "catholizare",
  project: "saas-salud-mental",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true
});
