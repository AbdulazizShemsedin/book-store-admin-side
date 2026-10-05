/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  modularizeImports: {
    '@phosphor-icons/react': {
      transform: '@phosphor-icons/react/dist/ssr/{{member}}',
      skipDefaultConversion: true,
    },
  },
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react', 'recharts'],
  },
};

export default nextConfig;
