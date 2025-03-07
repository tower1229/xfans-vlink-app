/**
 * 请求日志记录中间件
 * @param {Request} request 请求对象
 * @param {Function} next 下一个处理函数
 * @returns {Promise<Response>} 响应对象
 */
export async function withLogger(request, next) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const method = request.method;
  const url = request.url;

  // 记录请求开始
  console.log(`[${requestId}] ${method} ${url} - 开始处理`);

  try {
    // 调用下一个处理函数
    const response = await next(request);

    // 计算处理时间
    const duration = Date.now() - startTime;

    // 记录请求完成
    console.log(
      `[${requestId}] ${method} ${url} - 完成 (${response.status}) [${duration}ms]`
    );

    return response;
  } catch (error) {
    // 计算处理时间
    const duration = Date.now() - startTime;

    // 记录请求错误
    console.error(
      `[${requestId}] ${method} ${url} - 错误: ${error.message} [${duration}ms]`
    );

    // 重新抛出错误，让错误处理中间件处理
    throw error;
  }
}

/**
 * 生成唯一的请求ID
 * @returns {string} 请求ID
 */
function generateRequestId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
