import { LANG_MAP } from '@/constants';
import { consoleClors } from '@/constants/colors';
import { LogType, Phrase } from '@/types/common';

const { cyan, green, red, yellow, reset } = consoleClors;

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

/**
 * Takes a language code as input and returns the corresponding language
 * name or the uppercase code if no match is found.
 * @param {string} langCode - a string representing a language code.
 * @returns the name of a language based on the language code or the first
 * two characters of the language code in uppercase.
 */
export const getLanguageName = (langCode: string): string => {
  const language = langCode.split('-')[0];
  return LANG_MAP[language] || langCode.slice(0, 2).toUpperCase();
};

/**
 * Takes a language code and an array of phrases, and returns a random
 * phrase in the specified language.
 * @param {string} langCode - a string that represents the language code.
 * @param {Phrase[]} phrases - an array of objects where each object represents a phrase in different
 * languages.
 * @returns a random phrase in the specified language from the provided array of phrases.
 */
export const getRandomPhrase = (
  langCode: string,
  phrases: Phrase[]
): string => {
  const lang = langCode.split('-')[0];
  const object = phrases[Math.floor(Math.random() * phrases.length)];
  return object[lang as keyof Phrase];
};

/**
 * Removes emojis and smileys from a given input string.
 * @param {string} input - a text string.
 * @returns the input string with emojis and smileys removed.
 */
export const prepareTextForSynthesis = (input: string): string => {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{1F004}-\u{1F0CF}\u{3030}\u{25AA}\u{25FE}\u{00AE}\u{00A9}\u{2122}\u{1F004}\u{1F0CF}\u{2049}\u{2764}\u{FE0F}\u{200D}]/gu;
  return input.replace(emojiRegex, '');
};
