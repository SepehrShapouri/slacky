/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode:false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@node-rs/argon2"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
        
      },
      {
        protocol:"https",
        hostname:"utfs.io",
        pathname:"/**"
      }
    ],
  },
};

export default nextConfig;
