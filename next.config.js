/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  assetPrefix: process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production' ? '/game/connect4plus' : '',
  basePath: process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production' ? '/game/connect4plus' : '',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig 