/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      },
      {
        protocol: 'http',
        hostname: '**'
      }
    ]
  }
};

module.exports = nextConfig;
