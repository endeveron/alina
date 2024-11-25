import * as Speech from 'expo-speech';

import { LangCode } from '@/core/types/chat';
import { Language, Result } from '@/core/types/common';

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

// /**
//  * Retrieves and handles available voices for English
//  * and Ukrainian languages on a device, storing voices in AsyncStorage if found.
//  * @returns The function `handleDeviceVoces` returns a Promise that resolves to an object containing
//  * the `enVoiceId` and `ukVoiceId` for preferred voices on the device.
//  */
// export const handleDeviceVoces = async ({
//   prefVoiceMap,
// }: {
//   prefVoiceMap: Map<LangCode, string>;
// }): Promise<
//   Result<{
//     voiceMap: Map<LangCode, string>;
//     notFoundLangCodes: string[];
//   }>
// > => {
//   const langMap = new Map<LangCode, Language[]>();
//   const resultMap = new Map<LangCode, string>();
//   const notFoundLangCodes: string[] = [];

//   const langCodes = Array.from(prefVoiceMap.keys());

//   // Check avaliable voices
//   const availableVoices = await Speech.getAvailableVoicesAsync();

//   // Initialize langMap
//   langCodes.forEach((langCode) => {
//     langMap.set(langCode, []);
//   });

//   // Fill out langMap and netVoiceMap
//   langMap.forEach((_, key) => {
//     // Get all voices for particular language ('en-US', etc)
//     const langVoices = availableVoices.filter((v) => v.language === key);

//     // Search the preferred language in langVoices
//     const prefLangId = prefVoiceMap.get(key);
//     const prefLangIndex = langVoices.findIndex(
//       (v) => v.identifier === prefLangId
//     );
//     if (prefLangIndex !== -1) {
//       const prefLang = langVoices[prefLangIndex];
//       resultMap.set(key, prefLang.identifier);
//     }

//     if (langVoices.length) {
//       const netVoices = langVoices.filter((v) => {
//         return v.identifier.endsWith('-network');
//       });
//       let resultVoice;
//       if (netVoices.length) resultVoice = netVoices[0];
//       else resultVoice = langVoices[0];
//       resultMap.set(key, resultVoice.identifier);
//     } else {
//       notFoundLangCodes.push(key);
//     }
//   });

//   const voiceData = {
//     voiceMap: resultMap,
//     notFoundLangCodes,
//   };

//   return {
//     data: voiceData,
//     error: null,
//   };
// };
