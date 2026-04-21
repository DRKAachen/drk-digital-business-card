/** @type {import('next').NextConfig} */

const s3PublicUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || ''
let s3Hostname = ''
try {
  if (s3PublicUrl) s3Hostname = new URL(s3PublicUrl).hostname
} catch { /* ignored – env not set during dev */ }

const nextConfig = {
  output: 'standalone',
  sassOptions: {
    includePaths: ['./styles'],
  },
  images: {
    remotePatterns: s3Hostname
      ? [
          {
            protocol: 'https',
            hostname: s3Hostname,
          },
        ]
      : [],
  },

  /**
   * Security headers (DSGVO Art. 32 – "appropriate technical measures").
   * Applied to all routes.
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
