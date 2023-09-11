import Exception from './exception';
import { StatusCodes } from 'http-status-codes';

export class UnauthorizedException extends Exception {
  /**
   * @param msg
   * @param code
   */
  constructor(
    msg: string | undefined = 'Unauthorized',
    code: number | undefined = StatusCodes.UNAUTHORIZED,
  ) {
    if (msg === undefined && code === undefined) {
      super('Unauthorized', StatusCodes.UNAUTHORIZED);
    } else {
      super(msg, code);
    }
  }
}
