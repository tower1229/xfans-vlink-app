/**
 * 基础错误类
 */
export class AppError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

/**
 * 订单相关错误
 */
export class OrderError extends AppError {
  constructor(message: string, code = "ORDER_ERROR") {
    super(message, code);
  }
}

/**
 * 资源未找到错误
 */
export class NotFoundError extends AppError {
  constructor(message: string, code = "NOT_FOUND") {
    super(message, code);
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  constructor(message: string, code = "VALIDATION_ERROR") {
    super(message, code);
  }
}

/**
 * 未授权错误
 */
export class UnauthorizedError extends AppError {
  constructor(message: string, code = "UNAUTHORIZED") {
    super(message, code);
  }
}

/**
 * 禁止访问错误
 */
export class ForbiddenError extends AppError {
  constructor(message: string, code = "FORBIDDEN") {
    super(message, code);
  }
}

/**
 * 服务器内部错误
 */
export class InternalError extends AppError {
  constructor(message: string, code = "INTERNAL_ERROR") {
    super(message, code);
  }
}

/**
 * 用户相关错误
 */
export class UserError extends AppError {
  constructor(message: string, code = "USER_ERROR") {
    super(message, code);
  }
}

/**
 * 支付相关错误
 */
export class PaymentError extends AppError {
  constructor(message: string, code = "PAYMENT_ERROR") {
    super(message, code);
  }
}

/**
 * 帖子相关错误
 */
export class PostError extends AppError {
  constructor(message: string, code = "POST_ERROR") {
    super(message, code);
  }
}
