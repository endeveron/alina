import { API_BASE_URL, BASE_HEADERS } from '@/src/constants';
import { AuthData } from '@/src/types/auth';
import { AskAIResData, GoogleSpeechToTextConfig } from '@/src/types/chat';
import { Result } from '@/src/types/common';

export const postChat = async ({
  authData,
  config,
  recordingBase64,
}: {
  authData: AuthData;
  config: GoogleSpeechToTextConfig;
  recordingBase64: string;
}): Promise<Result<AskAIResData>> => {
  const defaultErrMessage = `Unable to transcribe speech`;
  try {
    const response = await fetch(`${API_BASE_URL}/chat/`, {
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
    console.error(`postChat ${err}`);
    return { data: null, error: { message: err.message } };
  }
};
