/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['http://localhost:3000'],
  webpack: (config, { isServer }) => {
    // Prevent bundling Node core modules into client-side builds.
    // Some firebase compat packages reference 'net'/'tls' which are Node-only.
    if (!isServer) {
      config.resolve.fallback = Object.assign({}, config.resolve.fallback, {
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        http2: false,
      });
      // Map `node:`-prefixed imports (e.g. `node:events`) to their browser-safe polyfills where appropriate.
      config.resolve.alias = Object.assign({}, config.resolve.alias, {
        'node:events': require.resolve('events'),
      });
    }
    return config;
  },
}

module.exports = nextConfig
