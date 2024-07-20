export default () => ({
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  database: {
    name: process.env.DB_NAME,
    type: 'sqlite',
  },
  swapi: {
    baseUrl: 'https://swapi.dev/api',
  },
});
