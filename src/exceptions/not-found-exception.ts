import Exception from './exception';
import { StatusCodes } from 'http-status-codes';

export class NotFoundException extends Exception {
  /**
   * @param msg
   */
  constructor(msg?: string, code?: number) {
    super(msg || 'Not Found', code || StatusCodes.NOT_FOUND);
  }
}
