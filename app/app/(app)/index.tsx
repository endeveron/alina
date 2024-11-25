import AntIcon from '@expo/vector-icons/AntDesign';
import IonIcon from '@expo/vector-icons/Ionicons';
import { Audio } from 'expo-av';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/Text';
import { useSession } from '@/core/context/SessionProvider';
import { askAI, recordSpeech } from '@/core/functions/chat';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import { useToast } from '@/core/hooks/useToast';
import { LangCode } from '@/core/types/chat';
import { prepareTextForSynthesis } from '@/core/utils/voiceSynthesis';
import { greetings } from '@/core/constants/phrases';

const recording = new Audio.Recording();

const bgImageSourceMap = new Map([
  [1, require(`@/assets/images/bg/bg-1.jpg`)],
  [2, require(`@/assets/images/bg/bg-2.jpg`)],
  [3, require(`@/assets/images/bg/bg-3.jpg`)],
  [4, require(`@/assets/images/bg/bg-4.jpg`)],
  [5, require(`@/assets/images/bg/bg-5.jpg`)],
]);
const bgImageMaxNumber = bgImageSourceMap.size;

const prefVoiceMap = new Map([
  [LangCode.en, 'en-us-x-tpf-network'],
  [LangCode.uk, 'uk-ua-x-hfd-network'],
]);

export default function HomeScreen() {
  const { session } = useSession();
  const { showToast } = useToast();
  const [langCode, setLanguageCode] = useState<LangCode>(LangCode.en);
  const [isRecording, setIsRecording] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [curBgImgNum, setCurBgImgNum] = useState(1);
  const [bgImgSource, setBgImgSource] = useState(bgImageSourceMap.get(1));

  const audioRecordingRef = useRef<Audio.Recording>(recording);
  const transcriptTimerRef = useRef<NodeJS.Timeout | null>(null);

  const authData = {
    token: session!.token,
    userId: session!.user.id,
  };

  const background = useThemeColor('background');
  const text = useThemeColor('text');
  const red = useThemeColor('red');

  const speakText = (text: string) => {
    Speech.speak(text, {
      language: langCode,
      voice: prefVoiceMap.get(langCode),
    });
    setAiMessage(text);

    // Auto hide the message
    if (transcriptTimerRef.current) clearTimeout(transcriptTimerRef.current);
    // Set the time of text transcription display depending on the text length
    const showTime = Math.floor(text.length / 10) * 1000 + 5000;
    transcriptTimerRef.current = setTimeout(() => {
      setAiMessage('');
    }, showTime);
  };

  const greet = () => {
    // Get greeting phrase
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    speakText(greeting);
  };

  const startRecording = async () => {
    setIsRecording(true);
    setAiMessage('');
    await recordSpeech(audioRecordingRef, setIsRecording, isPermissionGranted);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    // console.log(`T Start ${new Date()}`);

    setIsFetching(true);
    changeBackgroundImage();
    const askAIResult = await askAI({
      audioRecordingRef,
      authData,
      langCode,
    });
    setIsFetching(false);

    // console.log(`T Done ${new Date()}`);

    if (askAIResult.error) {
      showToast(askAIResult.error.message);
    }

    if (askAIResult.data) {
      setIsPermissionGranted(true);
      const { humanMessage, aiMessage: aiResponse } = askAIResult.data;

      // Remove emojis and smiles
      const textForSynthesis = prepareTextForSynthesis(aiResponse);

      speakText(textForSynthesis);
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

  const changeBackgroundImage = () => {
    const newBgImgNumber = curBgImgNum < bgImageMaxNumber ? curBgImgNum + 1 : 1;
    setBgImgSource(bgImageSourceMap.get(newBgImgNumber));
    setCurBgImgNum(newBgImgNumber);
  };

  useEffect(() => {
    greet();

    return () => {
      // Cleanup the timeout if the component unmounts
      if (transcriptTimerRef.current) {
        clearTimeout(transcriptTimerRef.current);
      }
    };
  }, []);

  return (
    <View className="relative flex-1">
      <View className="relative flex-1 flex-col justify-between py-16 z-20">
        {/* Screen title */}
        {/* <Text className="text-center font-pbold text-4xl py-8">Alina</Text> */}

        {/* Transcript section */}
        <ScrollView className="flex-col-reverse flex-1 rounded-[32px]">
          <View className="flex-col items-center justify-center">
            {/* {humanMessage ? (
              <View
                style={{ backgroundColor: background }}
                className="py-4 px-8 rounded-[32px] mb-4"
              >
                <Text
                  onPress={() => copyToClipboard(humanMessage)}
                  className="!font-pbold !text-xl/8 text-center w-auto"
                >
                  {humanMessage}
                </Text>
              </View>
            ) : null} */}
            {aiMessage ? (
              <View className="py-6 px-12 rounded-[32px] bg-slate-50">
                <Text
                  onPress={() => copyToClipboard(aiMessage)}
                  colorName="background"
                  className="!font-pbold !text-xl/8 text-center w-auto"
                >
                  {aiMessage}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Toolbar */}
        <View className="mt-12 gap-12">
          <View className="items-center justify-center">
            {/* Record button */}
            {isFetching ? (
              <View
                style={{ backgroundColor: background }}
                className="items-center justify-center w-28 h-28 rounded-full animate-bounce"
              >
                <AntIcon size={42} name="dingding" color="#fff" />
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <View
                  style={{ backgroundColor: isRecording ? red : text }}
                  className="w-28 h-28 items-center justify-center rounded-full"
                >
                  <IonIcon
                    size={42}
                    name={isRecording ? 'stop' : 'mic'}
                    color={isRecording ? '#fff' : background}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row items-center justify-center gap-4">
            {/* Language button */}
            <TouchableOpacity activeOpacity={0.5} onPress={toggleLanguage}>
              <View className="opacity-60 w-40 h-16 items-center justify-center rounded-full bg-white/10">
                <Text className="font-pmedium text-lg">
                  {langCode === LangCode.en ? 'English' : 'Українська'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Background image toggle */}
      <View
        onTouchEnd={changeBackgroundImage}
        className="absolute w-24 h-24 right-0 bottom-0 z-30"
      ></View>

      {/* Background image */}
      <View className="absolute flex-1 items-center justify-center h-full w-full inset-x-0 inset-y-0 z-10">
        <Image
          style={styles.image}
          source={bgImgSource}
          contentFit="cover"
          transition={500}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
  },
});
