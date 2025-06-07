export default class ApiError extends Error {
  // status = 404, 400, 500
  // errors = we can specify explicitely what element and what type of error
  // is encontered these will give us more specificity like
  //  eg {400, login error, {{field : "email", error : "email validation error"}}
  // stack so we can add and manipulate our custom stack trace
  constructor(
    status,
    message = "something bad happened",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.status = status;
    this.message = message;
    this.errors = errors;
    this.data = null;

    if (stack) {
      // if we are manually giving the stack trace these is used if we rethrowing the error
      this.stack = stack;
    } else {
      // so these line is responsible for finding a stack trace if it is not given
      // Error.captureStackTrace attachess the stack trace in the error object
      // this.constructor is given to ignore/remove the constructor from the stack trace
      // so the stack trace should be cleaner
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
