import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // Enable standalone output for optimized Docker images
  // Enable static export
  output: 'export',

  images: {
    unoptimized: true,
  },

  experimental: {

  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  compiler: {

    removeConsole: process.env.NODE_ENV === 'production',
  },

  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {

      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };

      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    // Production optimizations
    if (!dev) {
      // Disable source maps in production
      config.devtool = false;

      // Aggressive minification
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
        usedExports: true,
        sideEffects: true,
      };
    } else {
      // Development optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },


};

export default nextConfig;
