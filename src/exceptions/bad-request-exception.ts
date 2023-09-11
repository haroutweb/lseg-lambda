import Exception from './exception';
import { StatusCodes } from 'http-status-codes';

export class BadRequestException extends Exception {
  constructor(
    msg: string | undefined = 'Bad Request',
    code: number | undefined = StatusCodes.BAD_REQUEST,
  ) {
    if (msg === undefined && code === undefined) {
      super('Bad Request', StatusCodes.BAD_REQUEST);
    } else {
      super(msg, code);
    }
  }
}
