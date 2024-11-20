import FeatherIcons from '@expo/vector-icons/Feather';
import { PropsWithChildren, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import { Text } from '@/components/Text';
import { colors } from '@/core/constants/colors';

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <View>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <FeatherIcons
          name={isOpen ? 'chevron-down' : 'chevron-right'}
          size={18}
          color={theme === 'light' ? colors.light.icon : colors.dark.icon}
        />
        <Text type="subtitle">{title}</Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  content: {
    marginTop: 8,
    marginLeft: 4,
  },
});
