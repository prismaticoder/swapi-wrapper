# Star Wars API Wrapper

## Introduction

Welcome to the Star Wars API Wrapper! This project provides a simple and efficient way to access detailed information about characters (people) and planets from the Star Wars universe.

Whether you're developing a Star Wars-themed application, conducting data analysis, or just exploring the rich universe of Star Wars, this wrapper ensures a seamless and reliable experience.

The project was built using [Nest.js](https://github.com/nestjs/nest), a framework suited for the purpose of building scalable Node.js server side applications.

## Prerequisites

To aid with a quick setup of this project on your local environment, I have taken the liberty to add a [Docker](https://docs.docker.com/get-docker/) configuration to the setup to make things easier (details regarding this are outlined in the later sections of this document)

However, if you decide not to go the Docker route, the following requirements are needed to successfully run the application:

- [NPM (Node Package Manager)](https://www.npmjs.com/get-npm)
- [Node.js v18+](https://nodejs.org/en/download/)

## Description

The Star Wars API Wrapper is a simple and efficient tool designed to provide easy access to detailed information about characters (people) and planets from the Star Wars universe. This wrapper simplifies the process of making requests to the Star Wars API, handling aspects such as rate limiting, timeouts, and concurrency control to ensure reliable and efficient data retrieval.

With this API wrapper, you can:

- Fetch detailed information about Star Wars characters.
- Retrieve data about various planets in the Star Wars universe.

Whether you're building a Star Wars fan site, creating a data analysis project, or just exploring the Star Wars API for fun, this wrapper offers a convenient and reliable way to interact with the API.

Seeing that this project is API-based, I have taken the liberty to create a Postman documentation outlining all endpoints on the project (alongside relevant examples). View the documentation [here](https://documenter.getpostman.com/view/13400573/2s935pohwv)

## Installation (With Docker)

- Clone the repository:

```
git clone https://github.com/prismaticoder/swapi-wrapper.git
```

- Copy the example env file into your env

```
cp .env.example .env
```

- Build the container/image

```
docker-compose up --build
```

- You can now access the project on port <b>3000</b> 🎉

## Installation (Without Docker)

- Clone the repository:

```
git clone https://github.com/prismaticoder/swapi-wrapper.git
```

- Install dependencies

```bash
$ npm install
```

- Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Design Considerations

When building the Star Wars API Wrapper, several design considerations were taken into account to ensure reliability, efficiency, and optimal performance:

1. **Timeout Implementation**:

   - A timeout of 3 seconds is applied to all calls to the Star Wars API. This ensures that requests fail fast if the API does not respond within the expected timeframe, accounting for reliability especially when fetching associated resources.

2. **Rate Limiting**:

   - The API is rate limited to 30 requests every 5 minutes. This is designed to stay well within the Star Wars API's upper bound limit of 10,000 requests per day, preventing overuse and ensuring fair access for all users. This also helps in managing traffic and maintaining performance.

3. **Concurrency Control**:
   - A lock mechanism has been implemented to manage concurrency and prevent overloading the Star Wars API. This ensures that simultaneous requests are handled efficiently, reducing the risk of server overloads and maintaining the stability of the API.

These considerations help in providing a robust and reliable API wrapper for accessing Star Wars data while respecting the limitations and maintaining the performance of the underlying Star Wars API.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Links

- [Postman Documentation](https://documenter.getpostman.com/view/13400573/2sA3kVj1cL)
