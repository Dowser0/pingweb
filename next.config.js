/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Desabilita o Jest worker para evitar problemas de memória
    workerThreads: false,
    cpus: 1
  },
  // Otimizações para produção
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Configurações de cache
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 1
  }
}

module.exports = nextConfig 