import IonIcon from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { FieldError } from 'react-hook-form';
import {
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  TextInput,
  TextInputFocusEventData,
  TouchableOpacity,
  View,
} from 'react-native';

import { FormErrorMessage } from '@/components/FormErrorMessage';
import { Text } from '@/components/Text';
import { useThemeColor } from '@/hooks/useThemeColor';

export const FormField = ({
  name,
  label,
  value,
  placeholder,
  handleChangeText,
  containerClassName,
  numberOfLines = 1,
  keyboardType,
  onBlur,
  error,
}: {
  name: string;
  value: string;
  handleChangeText: (text: string) => void;
  label?: string;
  containerClassName?: string;
  placeholder?: string;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  error?: FieldError;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const text = useThemeColor('text');
  const input = useThemeColor('input');
  const red = useThemeColor('red');
  const muted = useThemeColor('muted');

  const nultiline = numberOfLines > 1;
  let heightClassName = 'h-16';

  if (nultiline) {
    switch (numberOfLines) {
      case 2:
        heightClassName = 'h-20';
        break;
      default:
        heightClassName = 'h-24';
    }
  }

  return (
    <View className={`${containerClassName}`}>
      {!!label ? (
        <Text colorName="muted" className="font-psemibold mb-3">
          {label}
        </Text>
      ) : null}

      <View
        style={{
          backgroundColor: input,
          borderColor: red,
          borderWidth: !!error ? 2 : 0,
        }}
        className={`${heightClassName} w-full px-4 border-2 rounded-xl flex flex-row items-center`}
      >
        <TextInput
          className="flex-1 font-pmedium text-xl"
          style={{ color: text }}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={muted}
          onChangeText={handleChangeText}
          onBlur={onBlur}
          multiline={nultiline}
          numberOfLines={numberOfLines}
          textAlignVertical={nultiline ? 'top' : 'center'}
          secureTextEntry={name === 'password' && !showPassword}
          keyboardType={keyboardType}
        />

        {name === 'password' ? (
          <TouchableOpacity
            className="opacity-70"
            onPress={() => setShowPassword(!showPassword)}
          >
            <IonIcon
              size={24}
              name={showPassword ? 'eye' : 'eye-off'}
              color={muted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {!!error ? <FormErrorMessage>{error.message}</FormErrorMessage> : null}
    </View>
  );
};
