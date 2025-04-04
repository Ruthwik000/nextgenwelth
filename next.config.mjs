/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
    ],
    domains: ['i.pinimg.com', 'newtechwave.io', 'images.unsplash.com']
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    turbo: {
      rules: {
        // Configure path aliases for Turbopack
        '@/*': ['./*'],
        '@/components/*': ['./components/*'],
        '@/lib/*': ['./lib/*'],
        '@/actions/*': ['./actions/*'],
        '@/hooks/*': ['./hooks/*'],
        '@/app/*': ['./app/*'],
        '@/types/*': ['./types/*']
      }
    }
  }
};

export default nextConfig;
