/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configuração para otimizar o build
  output: 'standalone',
  experimental: {
    optimizeCss: true
  }
}

module.exports = nextConfig 