/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tewba.et',
      },
      {
        protocol: 'https',
        hostname: '*.tewba.et',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
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
        source: '/api/upload/chunk',
        destination: '/internal/upload/chunk',
      },
      {
        source: '/api/:path*',
        destination: 'https://tewba.et/api/:path*',
      },
    ];
  },
};

export default nextConfig;
