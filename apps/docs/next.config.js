// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx');
const _ = require('lodash');

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  },
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/docs/basic',
        permanent: true,
      },
    ]
  },
  webpack: (config) => {
    _.set(
      config,
      'optimization.splitChunks.cacheGroups.commons.chunks',
      'initial'
    );

    return config;
  },
};

module.exports = withNx(nextConfig);
