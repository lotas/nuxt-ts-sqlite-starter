
export default class HttpError extends Error {
  public statusCode: number;

  constructor(message: any, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
  }
}
