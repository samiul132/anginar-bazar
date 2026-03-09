/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'app.anginarbazar.com',
      },
    ],
  },
};

export default nextConfig;