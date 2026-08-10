/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'stayguwahati-backend.onrender.com', // Add your backend host if applicable
      },
    ],
  },
};

module.exports = nextConfig;