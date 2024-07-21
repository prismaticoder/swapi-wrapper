export default () => ({
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  swapi: {
    baseUrl: 'https://swapi.dev/api',
  },
});
