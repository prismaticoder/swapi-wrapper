import { SwapiException } from './swapi.exception';

export class ResourceNotFound extends SwapiException {
  constructor(message?: string) {
    message = message || 'The requested resource was not found.';
    super(message);
  }
}
