module.exports = {
  apps: [
    {
      name: 'backend',
      script: './dist/src/server.js',
      node_args: '--env-file=.env.prod',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
