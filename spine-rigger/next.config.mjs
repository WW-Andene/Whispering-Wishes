/** @type {import('next').NextConfig} */
const nextConfig = {
  // Termux / Android has no @next/swc-android-arm64 native binary on npm,
  // so we force Next.js off the SWC path entirely: .babelrc.json triggers
  // the Babel compiler fallback, and swcMinify: false stops the final
  // bundle from invoking SWC for minification (Terser is used instead).
  swcMinify: false,
};
export default nextConfig;
