type Logger = {
  [key: string]: (msg: string, data?: any) => void;
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
const logToConsole = (color: string, msg: string, data: any) => {
  console.log(color, msg, data ? data : '');
};

/**
 *  Message text:
 * `r` - red,
 * `g` - green,
 * `y` - yellow,
 * `b` - blue
 */
const logger: Logger = {
  /**
   * Red message text
   *
   * @param  {string} msg  message text
   * @param  {any} data    data for logging
   */
  r: (msg: string, data: any) => logToConsole(colors.red, msg, data),

  /**
   * Green message text
   *
   * @param  {string} msg  message text
   * @param  {any} data    data for logging
   */
  g: (msg: string, data: any) => logToConsole(colors.green, msg, data),

  /**
   * Yellow message text
   *
   * @param  {string} msg  message text
   * @param  {any} data    data for logging
   */
  y: (msg: string, data: any) => logToConsole(colors.yellow, msg, data),

  /**
   * Blue message text
   *
   * @param  {string} msg  message text
   * @param  {any} data    data for logging
   */
  b: (msg: string, data: any) => logToConsole(colors.blue, msg, data),
};

export default logger;
