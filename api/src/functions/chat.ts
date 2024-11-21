import { Readable } from 'stream';
import speech from '@google-cloud/speech';

import {
  ELEVENLABS_API_KEY,
  ELEVENLABS_VOICEID_SARAH,
  GOOGLE_API_KEY,
  GOOGLE_PROJECT_ID,
} from '../constants';
import logger from '../helpers/logger';
import { GoogleSpeechToTextConfig, SpeechToTextResData } from '../types/chat';
import { Result } from '../types/common';
import { uploadAudioToGoogleStorage } from './upload';

const client = new speech.SpeechClient({
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

  try {
    // Make request to the google api
    // See https://cloud.google.com/speech-to-text/docs/reference/rest/v1/speech/recognize
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
      const parsedData = parseFloat(resData.totalBilledTime.replace(/s/g, ''));
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

  try {
    const request = {
      audio: { content: recordingBase64 },
      config: config,
    };

    // Detects speech in the audio file
    const [resData] = await client.recognize(request);
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
    const transcript = firstResult.alternatives[0].transcript;
    if (!transcript) {
      return {
        error: { message: `Unable to get transcript from the google client` },
        data: null,
      };
    }

    const totalBilledTime = (resData.totalBilledTime?.seconds as number) ?? 0;
    if (!totalBilledTime) console.error('Invalid totalBilledTime');
    const languageCode = firstResult.languageCode as string;
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

export const convertSpeechToText = async ({
  config,
  recordingBase64,
}: {
  config: GoogleSpeechToTextConfig;
  recordingBase64: string;
}): Promise<Result<SpeechToTextResData>> => {
  // const result = await convertSpeechToTextUsingGoogleAPI({
  //   config,
  //   recordingBase64,
  // });

  const result = await convertSpeechToTextUsingGoogleClient({
    config,
    recordingBase64,
  });

  console.log('result', result);

  return result;
};

export const askAi = async () => {};

export const convertTextToAudio = async ({ text }: { text: string }) => {
  const defaultErrMessage = `Unable to convert text to audio`;

  try {
    // Make request to the elevenlabs api
    // See https://elevenlabs.io/docs/api-reference/text-to-speech
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
    const uploadResult = await uploadAudioToGoogleStorage(readableStream);
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
    logger.r(`convertTextToSpeech: ${defaultErrMessage}`);
    return {
      error: { message: defaultErrMessage },
      data: null,
    };
  }
};
