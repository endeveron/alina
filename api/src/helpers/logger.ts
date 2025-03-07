type Logger = {
  [key: string]: (msg: string, data?: unknown) => void;
};

const colors = {
  red: '\x1b[31m%s\x1b[0m',
  green: '\x1b[32m%s\x1b[0m',
  yellow: '\x1b[33m%s\x1b[0m',
  blue: '\x1b[36m%s\x1b[0m',
};

/**
 * @param  {string} color  message color
 * @param  {string} msg    message text
 * @param  {any} data      data for logging
 */
const logToConsole = (color: string, msg: string, data: unknown) => {
  console.log(color, msg, data ? data : '');
};

const logger: Logger = {
  /**
   * Green message text
   *
   * @param  {string} msg  message text
   * @param  {any} data    data for logging
   */
  success: (msg: string, data: unknown) =>
    logToConsole(colors.green, msg, data),

  /**
   * Blue message text
   *
   * @param  {string} msg  message text
   * @param  {any} data    data for logging
   */
  info: (msg: string, data: unknown) =>
    logToConsole(colors.blue, `✔️ ${msg}`, data),

  /**
   * Yellow message text
   *
   * @param  {string} msg  message text
   * @param  {any} data    data for logging
   */
  warning: (msg: string, data: unknown) =>
    logToConsole(colors.yellow, msg, data),

  /**
   * Red message text
   *
   * @param  {string} msg  message text
   * @param  {any} data    data for logging
   */
  error: (msg: string, data: unknown) =>
    logToConsole(colors.red, `❌ ${msg}`, data),
};

export default logger;
