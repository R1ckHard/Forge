import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { colors, fonts } from '../theme/tokens';

const mark = require('../../assets/brand/logo-mark.png');

type Variant = 'mark' | 'wordmark';

type Props = {
  variant?: Variant;
  /** Mark size in px (also scales wordmark row). */
  size?: number;
  style?: StyleProp<ViewStyle>;
  markStyle?: StyleProp<ImageStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/** Forge brand mark / wordmark. */
export function Logo({
  variant = 'wordmark',
  size = 40,
  style,
  markStyle,
  textStyle,
}: Props) {
  if (variant === 'mark') {
    return (
      <Image
        source={mark}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size * 0.22,
            resizeMode: 'contain',
          },
          markStyle,
        ]}
        accessibilityLabel="Forge"
      />
    );
  }

  const textSize = Math.round(size * 0.72);
  return (
    <View style={[styles.row, style]}>
      <Image
        source={mark}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size * 0.22,
            resizeMode: 'contain',
          },
          markStyle,
        ]}
        accessibilityLabel=""
      />
      <Text
        style={[
          styles.word,
          { fontSize: textSize, lineHeight: textSize + 4 },
          textStyle,
        ]}
      >
        Forge
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  word: {
    fontFamily: fonts.display,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
});
