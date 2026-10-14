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
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react', 'recharts'],
  },
  async rewrites() {
    return [
      {
        source: '/admin/api/:path*',
        destination: 'https://tewba.et/admin/api/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'https://tewba.et/api/:path*',
      },
    ];
  },
};

export default nextConfig;
