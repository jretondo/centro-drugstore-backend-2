export = {
  apps: [
    {
      name: `P${process.env.PORT}-center-drugstore-prod`,
      script: 'dist/api/index.js',
      env: {
        PORT: process.env.PORT,
      },
    },
  ],
};
