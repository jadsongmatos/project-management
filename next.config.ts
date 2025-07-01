import type { NextConfig } from 'next'
 
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['mirrors.creativecommons.org'],
  },
  compress: true,
}
 
export default nextConfig