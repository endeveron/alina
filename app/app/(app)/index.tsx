import EntypoIcon from '@expo/vector-icons/Entypo';
import FontAwesomeIcon from '@expo/vector-icons/FontAwesome5';
import IonIcon from '@expo/vector-icons/Ionicons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Audio } from 'expo-av';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import * as Speech from 'expo-speech';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import AIAnimation from '@/src/components/AIAnimation';
import { Button } from '@/src/components/Button';
import { ButtonToggle } from '@/src/components/ButtonToggle';
import { StatusBar } from '@/src/components/StatusBar';
import { Text } from '@/src/components/Text';
import { useSession } from '@/src/context/SessionProvider';
import {
  factIntros,
  facts,
  greetings,
  welcomeGreetings,
} from '@/src/data/phrases';
import { askAI, recordSpeech } from '@/src/functions/chat';
import {
  getLanguageName,
  getRandomPhrase,
  logMessage,
  prepareTextForSynthesis,
} from '@/src/functions/helpers';
import {
  getAIMsgTranscrStatusFromAsyncStorage,
  getAudioPermissionStatusFromAsyncStorage,
  getChatLangCodeFromAsyncStorage,
  getGreetStatusFromAsyncStorage,
  getStorageNumber,
  saveAudioPermissionStatusInAsyncStorage,
  saveChatLangCodeInAsyncStorage,
  setAIMsgTranscrStatusInAsyncStorage,
  setGreetStatusInAsyncStorage,
  setStorageNumber,
} from '@/src/functions/store';
import { useThemeColor } from '@/src/hooks/useThemeColor';
import { useToast } from '@/src/hooks/useToast';
import { ChatConfig, LangCode } from '@/src/types/chat';
import { KEY_BG_IMAGE_NUMBER } from '@/src/constants/store';

const recording = new Audio.Recording();

const bgImageSourceMap = new Map([
  [1, require(`@/assets/images/bg/bg-1.jpg`)],
  [2, require(`@/assets/images/bg/bg-2.jpg`)],
  [3, require(`@/assets/images/bg/bg-3.jpg`)],
]);
const bgImageMaxNumber = bgImageSourceMap.size;

const prefVoiceMap = new Map([
  [LangCode.en, 'en-us-x-tpf-network'],
  [LangCode.uk, 'uk-ua-x-hfd-network'],
]);

const initialChatConfig: ChatConfig = {
  langCode: LangCode.en,
  isGreet: true,
  isAIMessagesTranscript: true,
};

export default function HomeScreen() {
  const { session, signOut } = useSession();
  const { showToast } = useToast();

  const [isAudioPermissions, setIsAudioPermissions] = useState(false);
  const [isRecordAllowed, setIsRecordAllowed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [langCode, setLangCode] = useState(initialChatConfig.langCode);
  const [isGreet, setIsGreet] = useState(initialChatConfig.isGreet);
  const [isAIMessagesTranscript, setIsAIMessagesTranscript] = useState(
    initialChatConfig.isAIMessagesTranscript
  );
  const [isFetching, setIsFetching] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [curBgImgNum, setCurBgImgNum] = useState(1);
  const [bgImgSource, setBgImgSource] = useState();

  const audioRecordingRef = useRef<Audio.Recording>(recording);
  const transcriptTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const bottomSheetSnapPoints = useMemo(() => ['40%'], []);

  const authData = {
    token: session!.token,
    userId: session!.user.id,
  };

  const text = useThemeColor('text');
  const red = useThemeColor('red');
  const border = useThemeColor('border');
  const background = useThemeColor('background');

  const handleStartRecording = async () => {
    setIsRecording(true);
    setAiMessage('');
    await recordSpeech(audioRecordingRef, setIsRecording);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    // console.log(`T Start ${new Date()}`);

    setIsFetching(true);
    // handleUpdBgImage();
    const askAIResult = await askAI({
      audioRecordingRef,
      authData,
      langCode: langCode,
    });
    setIsFetching(false);

    // console.log(`T Done ${new Date()}`);

    if (askAIResult.error) {
      showToast(askAIResult.error.message);
    }

    if (askAIResult.data) {
      const { humanMessage, aiMessage: aiResponse } = askAIResult.data;

      // Remove emojis and smiles
      const textForSynthesis = prepareTextForSynthesis(aiResponse);

      speakText(textForSynthesis);
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      // showToast('Copied to clipboard');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleToggleLanguage = async () => {
    const newLangCode = langCode === LangCode.en ? LangCode.uk : LangCode.en;
    const langCodeRes = await saveChatLangCodeInAsyncStorage(newLangCode);
    if (langCodeRes.error) logMessage(langCodeRes.error.message, 'error');
    setLangCode(newLangCode);
  };

  const handleToggleGreet = async () => {
    const newValue = !isGreet;
    // Save to storage
    const result = await setGreetStatusInAsyncStorage(newValue);
    if (result.error) logMessage(result.error.message, 'error');
    // Update local state
    setIsGreet(newValue);
  };

  const handleToggleTranscript = async () => {
    const newValue = !isAIMessagesTranscript;
    // Save to storage
    const result = await setAIMsgTranscrStatusInAsyncStorage(newValue);
    if (result.error) logMessage(result.error.message, 'error');
    // Update local state
    setIsAIMessagesTranscript(newValue);
  };

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const handleUpdBgImage = () => {
    const newBgImgNumber = curBgImgNum < bgImageMaxNumber ? curBgImgNum + 1 : 1;
    setBgImgSource(bgImageSourceMap.get(newBgImgNumber));
    setCurBgImgNum(newBgImgNumber);
    setStorageNumber(KEY_BG_IMAGE_NUMBER, newBgImgNumber);
  };

  const handleSpeakFact = () => {
    const intro = getRandomPhrase(langCode, factIntros);
    const fact = getRandomPhrase(langCode, facts);
    const text = `${intro} ${fact}`;
    speakText(text, langCode);
  };

  const getAudioPermissions = async () => {
    // Check async storage
    const audioPermStatusFromStorage =
      await getAudioPermissionStatusFromAsyncStorage();
    if (audioPermStatusFromStorage.data) {
      setIsAudioPermissions(true);
      return true;
    }

    const storePermissions = async () => {
      const storeStatus = await saveAudioPermissionStatusInAsyncStorage();
      if (storeStatus.error) logMessage(storeStatus.error.message, 'error');
      setIsAudioPermissions(true);
      return true;
    };

    try {
      // Get permissions status
      const permStatus = await Audio.getPermissionsAsync();
      if (permStatus?.status === 'granted') {
        storePermissions();
        return true;
      }
      // Request permissions
      const permResponse = await Audio.requestPermissionsAsync();
      if (permResponse?.status === 'granted') {
        storePermissions();
      } else {
        const message = `Oh sweetheart! We won’t be able to chat without your permission.`;
        speakText(message);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const initChatPreferences = async (): Promise<{
    isAIMsgTranscript: boolean;
    isGreet: boolean;
    isWelcome: boolean;
    langCode: string;
  } | null> => {
    let langCode = 'en-US';
    let isGreet = true;
    let isAIMsgTranscript = true;

    try {
      const langCodeRes = await getChatLangCodeFromAsyncStorage();
      const isGreetRes = await getGreetStatusFromAsyncStorage();
      const isAIMsgTranscriptRes =
        await getAIMsgTranscrStatusFromAsyncStorage();

      if (langCodeRes.error) logMessage(langCodeRes.error.message, 'error');
      if (isGreetRes.error) logMessage(isGreetRes.error.message, 'error');
      if (isAIMsgTranscriptRes.error)
        logMessage(isAIMsgTranscriptRes.error.message, 'error');

      // Initialize config on first app load
      if (!langCodeRes.data) {
        const saveLangCodeRes = await saveChatLangCodeInAsyncStorage(
          initialChatConfig.langCode
        );
        const saveIsGreetRes = await setGreetStatusInAsyncStorage(
          initialChatConfig.isGreet
        );
        const saveIsAIMsgTranscriptRes = await setGreetStatusInAsyncStorage(
          initialChatConfig.isAIMessagesTranscript
        );
        // Handle async storage errors
        if (saveLangCodeRes.error)
          logMessage(saveLangCodeRes.error.message, 'error');
        if (saveIsGreetRes.error)
          logMessage(saveIsGreetRes.error.message, 'error');
        if (saveIsAIMsgTranscriptRes.error)
          logMessage(saveIsAIMsgTranscriptRes.error.message, 'error');
        // Update local state
        if (langCodeRes.data) setLangCode(langCodeRes.data);
        if (isGreetRes.data) setIsGreet(isGreetRes.data);
        if (isAIMsgTranscriptRes.data)
          setIsAIMessagesTranscript(isAIMsgTranscriptRes.data);

        return {
          isAIMsgTranscript,
          isWelcome: true,
          isGreet,
          langCode,
        };
      }

      // Update local state
      if (langCodeRes.data) {
        langCode = langCodeRes.data;
        setLangCode(langCodeRes.data);
      }
      if (isGreetRes.data !== null) {
        isGreet = isGreetRes.data as boolean;
        setIsGreet((prev) => (prev = isGreet));
      }
      if (isAIMsgTranscriptRes.data !== null) {
        isAIMsgTranscript = isAIMsgTranscriptRes.data as boolean;
        setIsAIMessagesTranscript((prev) => (prev = isAIMsgTranscript));
      }

      return {
        isAIMsgTranscript,
        isGreet,
        isWelcome: false,
        langCode,
      };
    } catch (err: any) {
      console.error(err);
      return null;
    }
  };

  const speakText = (text: string, language?: string) => {
    setIsRecordAllowed(false);
    const lang = (language as LangCode) || (langCode as LangCode);
    Speech.speak(text.replace(',', ''), {
      language: lang,
      voice: prefVoiceMap.get(lang),
    });

    if (!isAIMessagesTranscript) {
      setIsRecordAllowed(true);
      return;
    }

    // Show audio transcript
    setAiMessage(text);
    // Auto hide the message
    if (transcriptTimerRef.current) clearTimeout(transcriptTimerRef.current);
    // Set the time of text transcription display depending on the text length
    const showTime = Math.floor(text.length / 10) * 1000 + 2000;
    transcriptTimerRef.current = setTimeout(() => {
      setAiMessage('');
      setIsRecordAllowed(true);
    }, showTime);
  };

  const setBackgroundImage = () => {
    // Get image key from MMKV storage
    let key = getStorageNumber(KEY_BG_IMAGE_NUMBER);
    if (!key) {
      setStorageNumber(KEY_BG_IMAGE_NUMBER, 1);
      key = 1;
    }
    setBgImgSource(bgImageSourceMap.get(key));
  };

  const initApp = async () => {
    // Set background image
    setBackgroundImage();

    // Check audio permissions
    const isGranted = await getAudioPermissions();
    setIsRecordAllowed(!!isGranted);

    // Initialize chat preferences
    const data = await initChatPreferences();
    if (!data) {
      const errMessage = `Unable to initialize chat`;
      showToast(errMessage);
      logMessage(errMessage, 'error');
      return;
    }

    // Greet user
    if (data.isGreet) {
      const phrases = data.isWelcome ? welcomeGreetings : greetings;
      const greeting = getRandomPhrase(data.langCode, phrases);
      speakText(greeting, data.langCode);
    }
  };

  useEffect(() => {
    initApp();

    // Clean up on component unmounts
    return () => {
      if (transcriptTimerRef.current) {
        clearTimeout(transcriptTimerRef.current);
      }
    };
  }, []);

  return (
    <View className="relative flex-1">
      <StatusBar />
      <View className="relative flex-1 flex-col justify-between pt-16 z-20">
        <View className="flex-grow"></View>
        {/* Transcript section */}
        <ScrollView className="flex-grow-0 mx-2 rounded-[32px]">
          {aiMessage ? (
            // Message container
            <View className="p-8 rounded-[32px] bg-white/95">
              <Text
                onPress={() => handleCopyToClipboard(aiMessage)}
                colorName="textInversed"
                className="font-pbold text-2xl w-auto text-center"
              >
                {aiMessage}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Buttons (Record / Stop) */}
        <View className="gap-12">
          <View className="items-center justify-center">
            {isAudioPermissions ? (
              <>
                {/* AI 'thinking' */}
                {isFetching ? (
                  <View className="-mb-5">
                    <AIAnimation />
                  </View>
                ) : null}

                {/* Record / Stop buttons */}
                {!isFetching && isRecordAllowed ? (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={
                      isRecording ? handleStopRecording : handleStartRecording
                    }
                  >
                    <View
                      style={{ backgroundColor: isRecording ? red : text }}
                      className="w-24 h-24 items-center justify-center rounded-full transition-colors"
                    >
                      {isRecording ? (
                        <IonIcon size={38} name="stop" color={text} />
                      ) : (
                        <FontAwesomeIcon
                          size={40}
                          name="microphone"
                          color={background}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : (
              <Button
                title="Allow Voice Chat"
                containerClassName="animation-fade-in"
                handlePress={getAudioPermissions}
              ></Button>
            )}
          </View>

          <View className="flex-row items-center justify-center gap-4">
            {/* Language button */}
            {isAudioPermissions ? (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={handleToggleLanguage}
              >
                <View className="opacity-60 w-40 h-16 items-center justify-center rounded-full bg-white/10">
                  <Text className="font-pmedium text-lg">
                    {getLanguageName(langCode)}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Bottom bar */}
        <View className="flex-row p-8 items-center justify-between">
          {/* Fast Fact */}
          <TouchableOpacity activeOpacity={0.5} onPress={handleSpeakFact}>
            <View className="opacity-60 w-16 h-16 items-center justify-center rounded-full bg-white/10">
              <IonIcon size={22} name="flash-outline" color={text} />
            </View>
          </TouchableOpacity>

          {/* Update background image */}
          <TouchableOpacity activeOpacity={0.5} onPress={handleUpdBgImage}>
            <View className="opacity-60 w-16 h-16 items-center justify-center rounded-full bg-white/10">
              <IonIcon size={22} name="sync-sharp" color={text} />
            </View>
          </TouchableOpacity>

          {/* Open Bottom Sheet */}
          <TouchableOpacity activeOpacity={0.5} onPress={handleOpenBottomSheet}>
            <View className="opacity-60 w-16 h-16 items-center justify-center rounded-full bg-white/10">
              <EntypoIcon size={18} name="dots-three-vertical" color={text} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={bottomSheetSnapPoints}
          enablePanDownToClose={true}
          handleIndicatorStyle={{ width: 80, backgroundColor: border }}
          backgroundStyle={{ backgroundColor: background, borderRadius: 24 }}
        >
          <BottomSheetView>
            <View className="p-8 pt-6 gap-4">
              {session?.user ? (
                <View className="">
                  <Text className="text-2xl font-pmedium">
                    {session.user.account.name}
                  </Text>
                  <Text colorName="muted" className="text-lg font-pmedium">
                    {session.user.account.email}
                  </Text>
                </View>
              ) : null}

              <View
                className="my-5 py-8 gap-6 border-t-2 border-b-2"
                style={{ borderColor: border }}
              >
                {/* Greet message */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-pmedium ">
                    Greet at session start
                  </Text>
                  <ButtonToggle
                    isActive={isGreet}
                    onChange={handleToggleGreet}
                  />
                </View>
                {/* AI messages */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-pmedium ">
                    Transcript AI messages
                  </Text>
                  <ButtonToggle
                    isActive={isAIMessagesTranscript}
                    onChange={handleToggleTranscript}
                  />
                </View>
              </View>
              {/* Sign Out */}
              <View className="flex-row items-center justify-between">
                <TouchableOpacity activeOpacity={0.5} onPress={signOut}>
                  <Text colorName="muted" className="text-lg font-pmedium">
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>

      {/* Background image */}
      <View className="absolute flex-1 items-center justify-center h-full w-full inset-x-0 inset-y-0 z-10">
        <Image
          style={{ flex: 1, width: '100%' }}
          source={bgImgSource}
          contentFit="cover"
          transition={500}
        />
      </View>
    </View>
  );
}
