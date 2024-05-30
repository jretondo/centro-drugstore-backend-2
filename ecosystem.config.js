module.exports = {
    apps: [{
        name: "P3003-center-drugstore-prod",
        script: "dist/api/index.js",
        env: {
          "PORT": 3003
        },
      }]
}