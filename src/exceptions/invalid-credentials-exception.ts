import { StatusCodes } from 'http-status-codes';
import { UnauthorizedException } from './unauthorized-exception';

export class InvalidCredentialsException extends UnauthorizedException {
  /**
   * @param msg
   * @param code
   */
  constructor(
    msg: string | undefined = 'The user credentials were incorrect',
    code: number | undefined = StatusCodes.UNAUTHORIZED,
  ) {
    super(msg, code);
  }
}
