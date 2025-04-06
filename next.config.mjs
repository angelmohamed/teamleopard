// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     images: {
//       // Next.js 13+ approach
//       remotePatterns: [
//         {
//           protocol: 'https',
//           hostname: 'i.ibb.co',
//         },
//         {
//             protocol: 'https',
//             hostname: 'images.unsplash.com',
//         },
//         {
//             protocol: 'https',
//             hostname: 'assets.aceternity.com',
//         },
//       ],
//       // If you're on older Next.js versions (<=12.x), use:
//       // domains: ['images.unsplash.com'],
//     },
//   };

// export default nextConfig;
import { fileURLToPath } from 'url';
import path from 'path';

/** Resolve __dirname in ESM */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
  },
  webpack(config) {
    config.resolve.alias['@'] = __dirname;
    return config;
  },
};

export default nextConfig;
  