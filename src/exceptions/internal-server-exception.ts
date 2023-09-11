import Exception from './exception';
import { StatusCodes } from 'http-status-codes';

export class InternalServerException extends Exception {
  constructor(msg = '', code: number = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(msg, code);
  }
}
