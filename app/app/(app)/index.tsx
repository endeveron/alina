import { Audio } from 'expo-av';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';

import IonIcon from '@expo/vector-icons/Ionicons';
import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/Text';
import { recordSpeech, transcribeSpeech } from '@/core/functions/chat';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import { LangCode, TranscriptionAlternative } from '@/core/types/chat';
import { useToast } from '@/core/hooks/useToast';
import { useSession } from '@/core/context/SessionProvider';
import { postTextToSpeech } from '@/core/services/chat';

const recording = new Audio.Recording();

export default function HomeScreen() {
  const { session, signOut } = useSession();
  const { showToast } = useToast();
  const [languageCode, setLanguageCode] = useState<LangCode>(LangCode.en);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [transcriptionAlternatives, setTranscriptionAlternatives] = useState<
    TranscriptionAlternative[]
  >([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioResponse, setAudioResponse] = useState<Audio.Sound | null>(null);

  const audioRecordingRef = useRef(recording);

  const authData = {
    token: session!.token,
    userId: session!.user.id,
  };

  const card = useThemeColor('card');
  const border = useThemeColor('border');
  const brand = useThemeColor('brand');
  const icon = useThemeColor('icon');
  const red = useThemeColor('red');

  const startRecording = async () => {
    console.log('Start recording');
    setIsRecording(true);
    setTranscriptionAlternatives([]);

    await recordSpeech(audioRecordingRef, setIsRecording, isPermissionGranted);
  };

  const stopRecording = async () => {
    console.log('Stop recording');
    setIsRecording(false);

    setIsTranscribing(true);
    const transcriptResult = await transcribeSpeech({
      audioRecordingRef,
      authData,
      languageCode,
    });
    // const transcriptResult = await transcribeSpeechDev();
    setIsTranscribing(false);

    if (transcriptResult.error) {
      showToast(transcriptResult.error.message);
    }

    if (transcriptResult.data) {
      setIsPermissionGranted(true);
      const { alternatives, totalBilledTime } = transcriptResult.data;
      setTranscriptionAlternatives(alternatives);
    }

    try {
      // setTranscription(speechTranscript || '');
    } catch (e) {
      console.error(e);
    } finally {
    }
  };

  const toggleLanguage = () => {
    setLanguageCode((prev) =>
      prev === LangCode.en ? LangCode.uk : LangCode.en
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      // showToast('Copied to clipboard');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDev = async () => {
    // const result = await postTextToSpeech({
    //   authData,
    //   text: 'how are you?',
    // });
    // if (result.error) {
    //   console.log('result.error.message', result.error.message);
    // }
    // if (result.data) {
    //   const audioUrl = result.data.audioUrl;
    //   // console.log('audioUrl', audioUrl);
    //   // Create an audio player using expo-av
    //   const { sound } = await Audio.Sound.createAsync(
    //     { uri: audioUrl },
    //     { shouldPlay: true }
    //   );
    //   console.log('Audio started');
    //   setAudioResponse(sound);
    //   setIsPlaying(true);
    // }
  };

  // const stopAudioResponse = async () => {
  //   if (audioResponse) {
  //     await audioResponse.stopAsync();
  //     setIsPlaying(false);
  //   }
  // };

  useEffect(() => {
    return () => {
      // Clean up the audioResponse object when the component is unmounted
      if (audioResponse) {
        audioResponse.unloadAsync();
      }
    };
  }, [audioResponse]);

  return (
    <SafeAreaView className="flex-1 flex-col justify-between py-16">
      {/* Screen title */}
      <Text className="text-center font-pbold text-4xl py-8">
        Speech {'>'} Text
      </Text>

      {/* Transcription section */}
      <ScrollView className="flex-1 rounded-3xl">
        <View
          style={{ backgroundColor: card }}
          className="p-8 min-h-96 rounded-3xl"
        >
          {/* Show a message if the transcription hasn't been fetched */}
          {transcriptionAlternatives.length === 0 && (
            <Text className="text-center" colorName="muted">
              Your transcription will appear here
            </Text>
          )}

          {/* Render the first alternative */}
          {!!transcriptionAlternatives.length ? (
            <Text
              onPress={() =>
                copyToClipboard(transcriptionAlternatives[0].transcript)
              }
              className="!font-pmedium !text-xl/10"
              key={0}
            >
              {transcriptionAlternatives[0].transcript}
            </Text>
          ) : null}

          {/* Render other alternatives */}
          {transcriptionAlternatives.length > 1 ? (
            <View style={{ borderTopColor: border }} className="mt-4">
              {transcriptionAlternatives.slice(1).map((data, index) => (
                <View
                  style={{ borderTopColor: border }}
                  className="border-t-[1px] mt-4 pt-6 pb-2"
                  key={index + 1}
                >
                  <Text
                    onPress={() => copyToClipboard(data.transcript)}
                    colorName="muted"
                  >
                    {data.transcript}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Toolbar */}
      <View className="mt-12 gap-12">
        <View className="items-center justify-center gap-8">
          {/* Record button */}
          {isTranscribing ? (
            <View
              style={{ backgroundColor: card }}
              className="w-20 h-20 items-center justify-center rounded-full animate-pulse"
              key="a"
            >
              <View className="flex-row items-center justify-center w-8 h-8">
                <IonIcon size={28} name="hardware-chip" color="#fff" />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View
                style={{ backgroundColor: isRecording ? red : brand }}
                className="w-20 h-20 items-center justify-center rounded-full"
              >
                <IonIcon
                  size={24}
                  name={isRecording ? 'stop' : 'mic'}
                  color="#fff"
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row items-center justify-center gap-4">
          {/* Language button */}
          <TouchableOpacity activeOpacity={0.5} onPress={toggleLanguage}>
            <View
              style={{ backgroundColor: card }}
              className="w-40 h-16 items-center justify-center rounded-full"
            >
              <Text colorName="icon" className="font-pmedium text-base">
                {languageCode === LangCode.en ? 'English' : 'Українська'}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} onPress={signOut}>
            <View
              style={{ backgroundColor: card }}
              className="w-16 h-16 items-center justify-center rounded-full"
            >
              <Text colorName="icon" className="font-pmedium text-base">
                Exit
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} onPress={handleDev}>
            <View
              style={{ backgroundColor: card }}
              className="w-16 h-16 items-center justify-center rounded-full"
            >
              <Text colorName="icon" className="font-pmedium text-base">
                Dev
              </Text>
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity activeOpacity={0.5} onPress={stopAudioResponse}>
            <View
              style={{ backgroundColor: card }}
              className="w-16 h-16 items-center justify-center rounded-full"
            >
              <Text colorName="icon" className="font-pmedium text-base">
                Stop
              </Text>
            </View>
          </TouchableOpacity> */}
        </View>
      </View>
    </SafeAreaView>
  );
}
