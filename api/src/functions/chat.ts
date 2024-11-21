import { Readable } from 'stream';
import speechToText from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';

import {
  ELEVENLABS_API_KEY,
  ELEVENLABS_VOICEID_SARAH,
  GOOGLE_API_KEY,
  GOOGLE_PROJECT_ID,
} from '../constants';
import logger from '../helpers/logger';
import {
  GoogleSpeechToTextConfig,
  LanguageCode,
  SpeechToTextResData,
} from '../types/chat';
import { Result } from '../types/common';
import { uploadReadableStreamToGoogleStorage } from './upload';

const speechToTextClient = new speechToText.SpeechClient({
  projectId: GOOGLE_PROJECT_ID,
  keyFilename: 'google-sa.json',
});

const textToSpeechClient = new textToSpeech.TextToSpeechClient({
  projectId: GOOGLE_PROJECT_ID,
  keyFilename: 'google-sa.json',
});

const convertSpeechToTextUsingGoogleAPI = async ({
  config,
  recordingBase64,
}: {
  config: GoogleSpeechToTextConfig;
  recordingBase64: string;
}): Promise<Result<SpeechToTextResData>> => {
  const defaultErrMessage = `Unable to transcribe speech`;

  // Make request to the google api
  // https://cloud.google.com/speech-to-text/docs/reference/rest/v1/speech/recognize
  try {
    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config,
        audio: { content: recordingBase64 },
      }),
    };
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
      options
    );

    if (response && !response.ok) {
      return {
        error: { message: defaultErrMessage },
        data: null,
      };
    }

    const resData = await response.json();
    if (!resData?.results[0]?.alternatives[0]) {
      return {
        error: { message: `Unable to get data from the google api` },
        data: null,
      };
    }

    // resData {
    //   results: [
    //     {
    //       alternatives: [Array],
    //       resultEndTime: '2.550s',
    //       languageCode: 'en-us'
    //     }
    //   ],
    //   totalBilledTime: '3s',
    //   requestId: '884987086151728353'
    // }

    // // Get transcript
    // const transcript = resData.results[0].alternatives[0].transcript ?? '';
    // if (!transcript) {
    //   return {
    //     error: { message: `Unable to get transcript from the google api` },
    //     data: null,
    //   };
    // }

    // Get transcript
    const firstResult = resData.results[0];
    if (!firstResult.alternatives?.length) {
      return {
        error: { message: `Unable to get alternatives from the google api` },
        data: null,
      };
    }
    const transcript = firstResult.alternatives[0].transcript;
    if (!transcript) {
      return {
        error: { message: `Unable to get transcript from the google api` },
        data: null,
      };
    }

    // The api should provide the totalBilledTime as a string, ending with 's'
    let totalBilledTime = 0;
    if (resData.totalBilledTime) {
      const parsedData = parseInt(
        resData.totalBilledTime.replace(/s/g, ''),
        10
      );
      if (typeof parsedData === 'number') {
        totalBilledTime = parsedData;
      } else {
        console.error('Invalid totalBilledTime');
      }
    }
    const languageCode = resData.languageCode;
    const requestId = resData.requestId;

    return {
      error: null,
      data: {
        languageCode,
        requestId,
        transcript,
        totalBilledTime,
      },
    };
  } catch (err: any) {
    logger.r(`convertSpeechToTextUsingGoogleAPI: ${defaultErrMessage}`);
    return {
      error: { message: defaultErrMessage },
      data: null,
    };
  }
};

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
    //       languageCode: 'en-us'
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

    const languageCode = firstResult.languageCode as LanguageCode;
    const requestId = resData.requestId as string;

    return {
      error: null,
      data: {
        languageCode,
        requestId,
        transcript,
        totalBilledTime,
      },
    };
  } catch (err: any) {
    logger.r(`convertSpeechToTextUsingGoogleClient: ${defaultErrMessage}`);
    return {
      error: { message: defaultErrMessage },
      data: null,
    };
  }
};

const convertTextToSpeechUsingElevenlabsAPI = async ({
  text,
}: {
  text: string;
}) => {
  const defaultErrMessage = `Unable to convert text to speech`;

  // Make request to the elevenlabs's text-to-speech api
  // https://elevenlabs.io/docs/api-reference/text-to-speech
  try {
    const options = {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2', // default: eleven_monolingual_v1
      }),
    };
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICEID_SARAH}`,
      options
    );

    if (response && !response.ok) {
      return {
        error: { message: defaultErrMessage },
        data: null,
      };
    }

    const audioStream: ReadableStream<Uint8Array> | null = response.body;
    if (!audioStream) {
      const errMessage = 'Unable to get audio stream from api';
      return {
        error: { message: errMessage },
        data: null,
      };
    }

    // Convert the Web Streams API ReadableStream to a Node.js Readable stream
    const readableStream = Readable.from(audioStream);

    // Upload audio stream to google cloud storage
    const uploadResult = await uploadReadableStreamToGoogleStorage(
      readableStream
    );
    if (!uploadResult.data) {
      const errMessage = 'Unable to upload audio to google storage';
      return {
        error: { message: errMessage },
        data: null,
      };
    }
    return {
      error: null,
      data: uploadResult.data,
    };
  } catch (err: any) {
    logger.r(`convertTextToSpeechUsingElevenlabsAPI: ${defaultErrMessage}`);
    return {
      error: { message: defaultErrMessage },
      data: null,
    };
  }
};

const convertTextToSpeechUsingGoogleClient = async ({
  text,
  languageCode,
}: {
  text: string;
  languageCode: LanguageCode;
}) => {
  const defaultErrMessage = `Unable to convert text to speech`;

  // https://codelabs.developers.google.com/codelabs/cloud-text-speech-node#6

  try {
    const [resData] = await textToSpeechClient.synthesizeSpeech({
      audioConfig: { audioEncoding: 'MP3' },
      input: { text },
      voice: {
        name:
          languageCode.toLowerCase() === 'en-us'
            ? 'en-US-Standard-H'
            : 'uk-UA-Standard-A',
        ssmlGender: 'FEMALE',
        languageCode,
      },
    });

    if (!resData.audioContent) {
      return {
        error: { message: `Unable to get audio buffer data` },
        data: null,
      };
    }

    const audioBuffer = Buffer.from(resData.audioContent);

    // Convert the Buffer data to a Node.js Readable stream
    const readableStream = Readable.from(audioBuffer);

    // Upload audio stream to google cloud storage
    const uploadResult = await uploadReadableStreamToGoogleStorage(
      readableStream
    );
    if (!uploadResult.data) {
      const errMessage = 'Unable to upload audio to google storage';
      return {
        error: { message: errMessage },
        data: null,
      };
    }
    return {
      error: null,
      data: uploadResult.data,
    };

    // // dev
    // return {
    //   error: null,
    //   data: null,
    // };
  } catch (err: any) {
    logger.r(`convertTextToSpeechUsingGoogleClient: ${defaultErrMessage}`);
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

  // console.log('convertSpeechToText result', result);
  return result;
};

export const convertTextToSpeech = async ({
  text,
  languageCode,
}: {
  text: string;
  languageCode: LanguageCode;
}) => {
  // // Make request to the elevenlabs's text-to-speech api
  // const result = await convertTextToSpeechUsingElevenlabsAPI({ text });

  // Make request to the elevenlabs's text-to-speech api
  const result = await convertTextToSpeechUsingGoogleClient({
    text,
    languageCode,
  });

  // console.log('convertTextToSpeech result', result);
  return result;
};

export const askAi = async () => {};
