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
import { useThemeColor } from '@/core/hooks/useThemeColor';

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

  const textColor = useThemeColor('text');
  const inputColor = useThemeColor('input');
  const borderColor = useThemeColor('border');
  const redColor = useThemeColor('red');
  const mutedColor = useThemeColor('muted');

  const nultiline = numberOfLines > 1;
  let heightClassName = 'h-14';

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
    <View className={`space-y-2 ${containerClassName}`}>
      {!!label ? (
        <Text colorName="muted" className="font-pmedium">
          {label}
        </Text>
      ) : null}

      <View
        style={{
          backgroundColor: inputColor,
          borderColor: !!error ? redColor : borderColor,
        }}
        className={`${heightClassName} w-full px-4 border-2 rounded-lg flex flex-row items-center`}
      >
        <TextInput
          className="flex-1 font-pmedium text-xl"
          style={{ color: textColor }}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={mutedColor}
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
            className="opacity-40"
            onPress={() => setShowPassword(!showPassword)}
          >
            <IonIcon
              size={24}
              name={showPassword ? 'eye' : 'eye-off'}
              color={mutedColor}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {!!error ? <FormErrorMessage>{error.message}</FormErrorMessage> : null}
    </View>
  );
};
