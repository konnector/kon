/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['img.youtube.com', 'images.unsplash.com', 'ui-avatars.com'],
    unoptimized: true,
  },
}

module.exports = nextConfig 