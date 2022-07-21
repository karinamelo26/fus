import { StatusCodes } from 'http-status-codes';
import { SetRequired } from 'type-fest';

import { Response, ResponseArgs } from './response';

export class Exception extends Response {
  constructor(args: SetRequired<Omit<ResponseArgs, 'success' | 'data'>, 'message'>) {
    super({ ...args, success: false, data: null });
  }
}

export class BadRequestException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.BAD_REQUEST, message });
  }
}

export class UnauthorizedException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.UNAUTHORIZED, message });
  }
}

export class PaymentRequiredException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.PAYMENT_REQUIRED, message });
  }
}

export class ForbiddenException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.FORBIDDEN, message });
  }
}

export class NotFoundException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.NOT_FOUND, message });
  }
}

export class MethodNotAllowedException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.METHOD_NOT_ALLOWED, message });
  }
}

export class NotAcceptableException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.NOT_ACCEPTABLE, message });
  }
}

export class ProxyAuthenticationRequiredException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.PROXY_AUTHENTICATION_REQUIRED, message });
  }
}

export class RequestTimeoutException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.REQUEST_TIMEOUT, message });
  }
}

export class ConflictException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.CONFLICT, message });
  }
}

export class GoneException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.GONE, message });
  }
}

export class LengthRequiredException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.LENGTH_REQUIRED, message });
  }
}

export class PreconditionFailedException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.PRECONDITION_FAILED, message });
  }
}

export class RequestTooLongException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.REQUEST_TOO_LONG, message });
  }
}

export class RequestURITooLongException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.REQUEST_URI_TOO_LONG, message });
  }
}

export class UnsupportedMediaTypeException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.UNSUPPORTED_MEDIA_TYPE, message });
  }
}

export class RequestedRangeNotSatisfiableException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.REQUESTED_RANGE_NOT_SATISFIABLE, message });
  }
}

export class ExpectationFailedException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.EXPECTATION_FAILED, message });
  }
}

export class IMATeapotException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.IM_A_TEAPOT, message });
  }
}

export class InternalServerErrorException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.INTERNAL_SERVER_ERROR, message });
  }
}

export class NotImplementedException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.NOT_IMPLEMENTED, message });
  }
}

export class BadGatewayException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.BAD_GATEWAY, message });
  }
}

export class ServiceUnavailableException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.SERVICE_UNAVAILABLE, message });
  }
}

export class GatewayTimeoutException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.GATEWAY_TIMEOUT, message });
  }
}

export class HTTPVersionNotSupportedException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.HTTP_VERSION_NOT_SUPPORTED, message });
  }
}

export class UnprocessableEntityException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.UNPROCESSABLE_ENTITY, message });
  }
}

export class LockedException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.LOCKED, message });
  }
}

export class FailedDependencyException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.FAILED_DEPENDENCY, message });
  }
}

export class PreconditionRequiredException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.PRECONDITION_REQUIRED, message });
  }
}

export class TooManyRequestsException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.TOO_MANY_REQUESTS, message });
  }
}

export class RequestHeaderFieldsTooLargeException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE, message });
  }
}

export class UnavailableForLegalReasonsException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.UNAVAILABLE_FOR_LEGAL_REASONS, message });
  }
}

export class InsufficientStorageException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.INSUFFICIENT_STORAGE, message });
  }
}

export class NetworkAuthenticationRequiredException extends Exception {
  constructor(message: string) {
    super({ statusCode: StatusCodes.NETWORK_AUTHENTICATION_REQUIRED, message });
  }
}
