import Exception from './exception';
import { StatusCodes } from 'http-status-codes';

export class PermissionDeniedException extends Exception {
  constructor() {
    super('Forbidden', StatusCodes.FORBIDDEN);
  }
}
