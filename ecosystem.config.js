module.exports = {
  apps: [
    {
      name: 'chatapi',
      script: './dist/app.js',
      watch: false,
      env: {
        PORT: 3000,
        NODE_ENV: 'development',
      },
      env_production: {
        PORT: 3030,
        NODE_ENV: 'production',
        DB_HOSTNAME: '',
        DB_NAME: 'chat-api',
        DB_USERNAME: '',
        DB_PASSWORD: '',
        PORT: '3030',
      },
    },
  ],
};
