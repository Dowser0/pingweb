/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  // Configuração para otimizar o build
  experimental: {
    optimizeCss: true
  }
}

module.exports = nextConfig 