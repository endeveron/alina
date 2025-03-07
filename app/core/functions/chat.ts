import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { Platform } from 'react-native';

import { postChat } from '@/core/services/chat';
import { recordingOptions } from '@/core/settings/audio';
import { AuthData } from '@/core/types/auth';
import { AskAIResData } from '@/core/types/chat';
import { Result } from '@/core/types/common';

export const recordSpeech = async (
  audioRecordingRef: MutableRefObject<Audio.Recording>,
  setIsRecording: Dispatch<SetStateAction<boolean>>
): Promise<{
  error: {
    message: string;
  } | null;
}> => {
  if (!audioRecordingRef.current) {
    return {
      error: { message: 'Invalid recording reference' },
    };
  }

  try {
    // Set up audio mode for iOS
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Check if the recording done
    const doneRecording = audioRecordingRef.current._isDoneRecording;
    if (doneRecording) audioRecordingRef.current = new Audio.Recording();

    const recordingStatus = await audioRecordingRef.current.getStatusAsync();
    setIsRecording(true);

    if (!recordingStatus?.canRecord) {
      // audioRecordingRef.current = new Audio.Recording();
      await audioRecordingRef.current.prepareToRecordAsync(recordingOptions);
    }

    // Start recording
    await audioRecordingRef.current.startAsync();
    return { error: null };
  } catch (err: any) {
    console.error(err);
    setIsRecording(false);
    return {
      error: { message: 'Unable to record speech' },
    };
  }
};

export const askAI = async ({
  audioRecordingRef,
  authData,
  langCode = 'en-US',
}: {
  audioRecordingRef: MutableRefObject<Audio.Recording>;
  authData: AuthData;
  langCode?: string;
}): Promise<Result<AskAIResData>> => {
  if (!audioRecordingRef.current) {
    return {
      data: null,
      error: { message: 'Invalid recording reference' },
    };
  }

  try {
    // Set up audio mode for iOS
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
    });

    // Check if the recording is prepared
    const isPrepared = audioRecordingRef?.current?._canRecord;
    if (!isPrepared) {
      return {
        data: null,
        error: { message: 'Recording must be prepared prior to unloading' },
      };
    }

    // Stop recording
    await audioRecordingRef.current.stopAndUnloadAsync();

    // Get the URI
    const recordingUri = audioRecordingRef.current.getURI();
    if (!recordingUri) {
      return {
        data: null,
        error: { message: 'Unable to get recording URI' },
      };
    }

    // Convert the recording to a base64 string
    const recordingBase64 = await FileSystem.readAsStringAsync(recordingUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!recordingBase64) {
      return {
        data: null,
        error: { message: 'Unable to encode recording to base64 format' },
      };
    }

    // Reset recording
    audioRecordingRef.current = new Audio.Recording();

    // Set up audio config
    const config = {
      encoding: Platform.OS === 'android' ? 'AMR_WB' : 'LINEAR16',
      sampleRateHertz: Platform.OS === 'android' ? 16000 : 41000,
      languageCode: langCode,
    };

    // Make request to server
    const result = await postChat({
      config,
      recordingBase64,
      authData,
    });

    if (result.error) {
      return {
        data: null,
        error: { message: result.error.message },
      };
    }

    // data: result.data: SpeechToTextResData = {
    //   alternatives: TranscriptionAlternative[];
    //   requestId: string;
    //   totalBilledTime: string;
    // };

    return {
      data: result.data,
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: 'Unable to transcribe speech' },
    };
  }
};
