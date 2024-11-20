import { NextFunction, Request, Response } from 'express';
import { Readable } from 'stream';

import { ELEVENLABS_API_KEY, GOOGLE_API_KEY } from '../constants';
import { uploadAudio } from '../functions/upload';
import { HttpError } from '../helpers/error';
import { isReqValid } from '../helpers/http';
import logger from '../helpers/logger';
import UserModel from '../models/user';

// Docs https://cloud.google.com/speech-to-text/docs/reference/rest/v1/RecognitionAudio

// Elevenlabs voices
const voiceIdJessica = 'cgSgspJ2msm6clMCkdW9'; // conversational, expressive
const voiceIdSarah = 'EXAVITQu4vr4xnSDxMaL'; // news, soft

export const speechToText = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;

  const { config, recordingBase64, userId } = req.body;
  const defaultErrMessage = `Unable to transcribe speech`;

  try {
    // Find a user in db
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new HttpError('Unable to get user data from db', 500));
    }

    // Make request to google api
    // See https://cloud.google.com/speech-to-text/docs/reference/rest/v1/speech/recognize
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          audio: { content: recordingBase64 },
        }),
      }
    );

    if (response && !response.ok) {
      logger.r(defaultErrMessage);
      next(new HttpError(defaultErrMessage, 500));
      return;
    }

    const resData = await response.json();

    // console.log('resData', resData);
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

    if (!resData?.results?.length) {
      logger.r(defaultErrMessage);
      next(new HttpError(defaultErrMessage, 500));
      return;
    }

    // Get totalBilledTime from db
    const totalBilledTimeFromDb =
      user.statistics.googleSpeechToText.totalBilledTime;

    // Get audio duration data from google api response.
    // It's should be a string, ending with 's'
    const totalBilledTimeFromGoogleApi = resData.totalBilledTime;
    let totalBilledTimeParsed = 0;
    if (totalBilledTimeFromGoogleApi) {
      const parsedData = parseFloat(
        totalBilledTimeFromGoogleApi.replace(/s/g, '')
      );
      if (typeof parsedData !== 'number') {
        console.error('Invalid totalBilledTime');
      }
      totalBilledTimeParsed = parsedData;
    }

    // Calculate a new value of total billed time
    const newTotalBilledTime = totalBilledTimeFromDb + totalBilledTimeParsed;

    // Update totalBilledTime in db
    user.statistics.googleSpeechToText.totalBilledTime = newTotalBilledTime;
    user.statistics.googleSpeechToText.updTimestamp = Date.now();

    await user.save();

    const data = {
      alternatives: resData.results[0].alternatives,
      requestId: resData.requestId,
      totalBilledTime: newTotalBilledTime,
    };

    res.status(200).json(data);
  } catch (err) {
    logger.r('speechToText', err);
    next(new HttpError(defaultErrMessage, 500));
  }
};

export const textToSpeech = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;

  const { text } = req.body;
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
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceIdJessica}`,
      options
    );

    if (response && !response.ok) {
      logger.r(defaultErrMessage);
      next(new HttpError(defaultErrMessage, 500));
      return;
    }

    const audioStream: ReadableStream<Uint8Array> | null = response.body;
    if (!audioStream) {
      const errMessage = 'Unable to get audio stream from api';
      logger.r(errMessage);
      next(new HttpError(errMessage, 500));
      return;
    }

    // Convert the Web Streams API ReadableStream to a Node.js Readable stream
    const readableStream = Readable.from(audioStream);

    // Upload audio stream to google cloud storage
    const result = await uploadAudio(readableStream);
    console.log('result', result);
    if (result.error) {
      next(new HttpError(result.error.message, 500));
      return;
    }

    res.status(200).json(result.data);

    // // Save audio stream to file
    // const result = await saveAudio(readableStream);
    // if (result.error) {
    //   next(new HttpError(result.error.message, 500));
    //   return;
    // }
    // console.log('result', result);

    // res.status(200).json({
    //   message: 'File successfully created',
    // });

    // // Set headers to indicate we are sending an MP3 file
    // res.setHeader('Content-Type', 'audio/mpeg');
    // // Pipe the Readable stream directly to the response
    // readableStream.pipe(res);

    // // Optionally, send a message after the stream ends
    // res.on('finish', () => {
    //   console.log('Audio streaming finished');
    // });

    // res.status(200).json({
    //   message: 'File successfully created',
    // });
  } catch (err) {
    logger.r('textToSpeech', err);
    next(new HttpError(defaultErrMessage, 500));
  }
};

// export const textToSpeechDev = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (!isReqValid(req, next)) return;

//   const { text } = req.body;
//   const defaultErrMessage = `Unable to convert text to audio`;

//   try {
//     const mp3FilePath = path.join(
//       __dirname,
//       '../../public/audio_1732039615045.mp3'
//     );
//     const audioStream = fs.createReadStream(mp3FilePath);

//     if (!audioStream) {
//       const errMessage = 'Unable to get audio stream from api';
//       logger.r(errMessage);
//       next(new HttpError(errMessage, 500));
//       return;
//     }

//     // Convert the Web Streams API ReadableStream to a Node.js Readable stream
//     const readableStream = Readable.from(audioStream);

//     // Upload audio stream to google cloud storage
//     const result = await uploadAudio(readableStream);
//     console.log('result', result);
//     if (result.error) {
//       next(new HttpError(result.error.message, 500));
//       return;
//     }

//     res.status(200).json(result.data);
//   } catch (err) {
//     logger.r('speechToText', err);
//     next(new HttpError(defaultErrMessage, 500));
//   }
// };
