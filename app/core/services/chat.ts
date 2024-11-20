import { API_BASE_URL, BASE_HEADERS } from '@/core/constants';
import { AuthData } from '@/core/types/auth';
import { Response } from '@/core/types/common';
import {
  GoogleSpeechToTextConfig,
  SpeechToTextResData,
} from '@/core/types/chat';

export const postSpeechToText = async ({
  authData,
  config,
  recordingBase64,
}: {
  authData: AuthData;
  config: GoogleSpeechToTextConfig;
  recordingBase64: string;
}): Promise<Response<SpeechToTextResData>> => {
  const defaultErrMessage = `Unable to transcribe speech`;
  try {
    const response = await fetch(`${API_BASE_URL}/chat/speech-to-text`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authData.token}`,
        ...BASE_HEADERS,
      },
      body: JSON.stringify({
        config,
        recordingBase64,
        userId: authData.userId,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { data: null, error: { message: 'unauthenticated' } };
      }
      return { data: null, error: { message: defaultErrMessage } };
    }

    const data = await response.json();
    return { data: data, error: null };
  } catch (err: any) {
    console.error(`postSpeechToText ${err}`);
    return { data: null, error: { message: err.message } };
  }
};

export const postTextToSpeech = async ({
  authData,
  text,
}: {
  authData: AuthData;
  text: string;
  // }) => {
}): Promise<Response<{ audioUrl: string }>> => {
  const defaultErrMessage = `Unable to create audio`;
  try {
    const response = await fetch(`${API_BASE_URL}/chat/text-to-speech`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authData.token}`,
        ...BASE_HEADERS,
      },
      body: JSON.stringify({
        text,
        userId: authData.userId,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { data: null, error: { message: 'unauthenticated' } };
      }
      return { data: null, error: { message: defaultErrMessage } };
    }

    const resData = await response.json();
    return { data: resData, error: null };
  } catch (err: any) {
    console.error(`postTextToSpeech ${err}`);
    return { data: null, error: { message: err.message } };
  }
};
