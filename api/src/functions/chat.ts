import speechToText from '@google-cloud/speech';

import {
  GoogleSpeechToTextConfig,
  LangCodeLower,
  SpeechToTextResData,
} from '../types/chat';
import { Result } from '../types/common';

const speechToTextClient = new speechToText.SpeechClient({
  keyFilename: 'google-sa.json',
});

// const convertSpeechToTextUsingGoogleAPI = async ({
//   config,
//   recordingBase64,
// }: {
//   config: GoogleSpeechToTextConfig;
//   recordingBase64: string;
// }): Promise<Result<SpeechToTextResData>> => {
//   const defaultErrMessage = `Unable to transcribe speech`;

//   // Make request to the google api
//   // https://cloud.google.com/speech-to-text/docs/reference/rest/v1/speech/recognize
//   try {
//     const options = {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         config,
//         audio: { content: recordingBase64 },
//       }),
//     };

//     // !! Get the right GOOGLE_API_KEY in Credentials > API Keys
//     // !! Restrictions : 'Cloud Speech-to-Text API'
//     // https://console.cloud.google.com/apis/credentials

//     const response = await fetch(
//       // `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
//       `https://speech.googleapis.com/v1/speech:recognize`,
//       options
//     );

//     if (response && !response.ok) {
//       return {
//         error: { message: defaultErrMessage },
//         data: null,
//       };
//     }

//     const resData = await response.json();
//     if (!resData?.results[0]?.alternatives[0]) {
//       return {
//         error: { message: `Unable to get data from the google api` },
//         data: null,
//       };
//     }

//     // resData {
//     //   results: [
//     //     {
//     //       alternatives: [Array],
//     //       resultEndTime: '2.550s',
//     //       langCode: 'en-us'
//     //     }
//     //   ],
//     //   totalBilledTime: '3s',
//     //   requestId: '884987086151728353'
//     // }

//     // // Get transcript
//     // const transcript = resData.results[0].alternatives[0].transcript ?? '';
//     // if (!transcript) {
//     //   return {
//     //     error: { message: `Unable to get transcript from the google api` },
//     //     data: null,
//     //   };
//     // }

//     // Get transcript
//     const firstResult = resData.results[0];
//     if (!firstResult.alternatives?.length) {
//       return {
//         error: { message: `Unable to get alternatives from the google api` },
//         data: null,
//       };
//     }
//     const transcript = firstResult.alternatives[0].transcript;
//     if (!transcript) {
//       return {
//         error: { message: `Unable to get transcript from the google api` },
//         data: null,
//       };
//     }

//     // The api should provide the totalBilledTime as a string, ending with 's'
//     let totalBilledTime = 0;
//     if (resData.totalBilledTime) {
//       const parsedData = parseInt(
//         resData.totalBilledTime.replace(/s/g, ''),
//         10
//       );
//       if (typeof parsedData === 'number') {
//         totalBilledTime = parsedData;
//       } else {
//         console.error('Invalid totalBilledTime');
//       }
//     }
//     const langCode = resData.langCode;
//     const requestId = resData.requestId;

//     return {
//       error: null,
//       data: {
//         langCode,
//         requestId,
//         transcript,
//         totalBilledTime,
//       },
//     };
//   } catch (err: any) {
//     logger.r(`convertSpeechToTextUsingGoogleAPI: ${defaultErrMessage}`);
//     return {
//       error: { message: defaultErrMessage },
//       data: null,
//     };
//   }
// };

const convertSpeechToTextUsingGoogleClient = async ({
  config,
  recordingBase64,
}: {
  config: GoogleSpeechToTextConfig;
  recordingBase64: string;
}): Promise<Result<SpeechToTextResData>> => {
  const defaultErrMessage = `Unable to transcribe speech`;

  // https://codelabs.developers.google.com/codelabs/cloud-speech-text-node#5

  try {
    const request = {
      audio: { content: recordingBase64 },
      config: config,
    };

    // Detects speech in the audio file
    const [resData] = await speechToTextClient.recognize(request);
    if (!resData.results?.length) {
      return {
        error: { message: `Unable to get data from the google client` },
        data: null,
      };
    }

    // resData {
    //   results: [
    //     {
    //       alternatives: [Array],
    //       channelTag: 0,
    //       resultEndTime: [Object],
    //       langCode: 'en-us'
    //     }
    //   ],
    //   totalBilledTime: { seconds: '2', nanos: 0 },
    //   speechAdaptationInfo: null,
    //   requestId: '623930791051385184'
    // }

    // Get transcript
    const firstResult = resData.results[0];
    if (!firstResult.alternatives?.length) {
      return {
        error: { message: `Unable to get alternatives from the google client` },
        data: null,
      };
    }
    // console.log('G-STT result', firstResult);

    const transcript = firstResult.alternatives[0].transcript;
    if (!transcript) {
      return {
        error: { message: `Unable to get transcript from the google client` },
        data: null,
      };
    }

    // Convert totalBilledTime (seconds) to an integer
    let totalBilledTime = 0;
    const seconds = resData.totalBilledTime?.seconds;
    if (typeof seconds === 'number') {
      totalBilledTime = seconds;
    } else if (typeof seconds === 'string') {
      totalBilledTime = parseInt(seconds, 10);
    } else {
      console.error('Invalid totalBilledTime value', resData.totalBilledTime);
    }

    const langCode = firstResult.languageCode as LangCodeLower;
    const requestId = resData.requestId as string;

    return {
      error: null,
      data: {
        langCode,
        requestId,
        transcript,
        totalBilledTime,
      },
    };
  } catch (err: any) {
    console.error(`convertSpeechToTextUsingGoogleClient: ${err}`);
    return {
      error: { message: defaultErrMessage },
      data: null,
    };
  }
};

export const convertSpeechToText = async ({
  config,
  recordingBase64,
}: {
  config: GoogleSpeechToTextConfig;
  recordingBase64: string;
}): Promise<Result<SpeechToTextResData>> => {
  // Make request to the google's speech-to-text api
  // const result = await convertSpeechToTextUsingGoogleAPI({
  //   config,
  //   recordingBase64,
  // });

  // Using the @google-cloud/speech library
  const result = await convertSpeechToTextUsingGoogleClient({
    config,
    recordingBase64,
  });

  return result;
};
