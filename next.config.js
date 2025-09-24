const webpack = require("webpack")

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ]
  },
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
    NEXT_PUBLIC_OPENROUTER_MODEL: process.env.NEXT_PUBLIC_OPENROUTER_MODEL,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@storybook/react": false, // Ignore Storybook in Thirdweb
    }
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.SUPABASE_URL": JSON.stringify(process.env.SUPABASE_URL),
        "process.env.SUPABASE_KEY": JSON.stringify(process.env.SUPABASE_KEY),
        "process.env.OPENROUTER_API_KEY": JSON.stringify(process.env.OPENROUTER_API_KEY),
        "process.env.OPENROUTER_MODEL": JSON.stringify(process.env.OPENROUTER_MODEL),
        "process.env.NEXT_PUBLIC_OPENROUTER_MODEL": JSON.stringify(process.env.NEXT_PUBLIC_OPENROUTER_MODEL),
      }),
    )
    return config
  },
}

module.exports = nextConfig
