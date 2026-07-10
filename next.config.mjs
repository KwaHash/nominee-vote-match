/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      encryptionKey: process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY,
    },
  },
};

export default nextConfig;
