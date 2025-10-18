/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Prevent bundling Node core modules into client-side builds.
    // Some firebase compat packages reference 'net'/'tls' which are Node-only.
    if (!isServer) {
      config.resolve.fallback = Object.assign({}, config.resolve.fallback, {
        net: false,
        tls: false,
        fs: false,
        child_process: false,
      });
    }
    return config;
  },
}

module.exports = nextConfig
