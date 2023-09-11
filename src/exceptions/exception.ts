export default class Exception extends Error {
  public message: string;
  public code: number;

  /**
   * @param message
   * @param code
   */
  public constructor(message: string, code = 500) {
    super(message);

    this.message = message;
    this.code = code;
  }

  public toString() {
    return this.message;
  }

  public getCode() {
    return this.code;
  }

  public getMessage() {
    return this.message;
  }
}
