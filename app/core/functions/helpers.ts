import { consoleClors } from '@/core/constants/colors';
import { LogType } from '@/core/types/common';

const { cyan, green, gray, red, yellow, reset } = consoleClors;

/**
 * Logs messages with different colors based on the type provided
 * (error, success, or default).
 * @param {string} message a string containing the message to be logged.
 * @param {LogType} [type] an optional parameter of type "info" | "success" | "error".
 */
export const logMessage = async (message: string, type?: LogType) => {
  try {
    switch (type) {
      case 'error': {
        console.info(`${red}%s${reset}`, message);
        // await saveLog(message, 'error');
        break;
      }
      case 'success': {
        console.info(`${green}%s${reset}`, message);
        // await saveLog(message, 'success');
        break;
      }
      case 'warning': {
        console.info(`${yellow}%s${reset}`, message);
        // await saveLog(message, 'warning');
        break;
      }
      default: {
        console.info(`${cyan}%s${reset}`, message);
        // await saveLog(message);
      }
    }
  } catch (error: any) {
    console.error(`logMessage: ${error}`);
  }
};
