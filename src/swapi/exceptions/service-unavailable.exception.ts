import { SwapiException } from './swapi.exception';

export class ServiceUnavailable extends SwapiException {
  constructor(message?: string) {
    message =
      message ||
      'This service is currently unavailable, please try again later.';
    super(message);
  }
}
