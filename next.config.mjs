/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      // Next.js 13+ approach
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'i.ibb.co',
        },
        {
            protocol: 'https',
            hostname: 'images.unsplash.com',
        },
        {
            protocol: 'https',
            hostname: 'assets.aceternity.com',
        },
      ],
      // If you're on older Next.js versions (<=12.x), use:
      // domains: ['images.unsplash.com'],
    },
  };

export default nextConfig;
  