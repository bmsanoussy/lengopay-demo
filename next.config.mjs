/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  allowedDevOrigins: ['52bc-2001-861-2442-39f0-c4d-f49d-8c69-5532.ngrok-free.app'],
};

export default nextConfig; 