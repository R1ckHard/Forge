import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

type MascotMood = 'idle' | 'charging' | 'celebrate' | 'thinking';

type Props = {
  size?: number;
  mood?: MascotMood;
  /** Animate only for events. Default: static first frame. */
  animated?: boolean;
};

const FRAMES: Record<MascotMood, ImageSourcePropType[]> = {
  idle: [
    require('../../assets/mascot/smithy-idle-1.png'),
    require('../../assets/mascot/smithy-idle-2.png'),
  ],
  charging: [
    require('../../assets/mascot/smithy-work-1.png'),
    require('../../assets/mascot/smithy-work-2.png'),
    require('../../assets/mascot/smithy-work-3.png'),
  ],
  thinking: [
    require('../../assets/mascot/smithy-think-1.png'),
    require('../../assets/mascot/smithy-think-2.png'),
  ],
  celebrate: [
    require('../../assets/mascot/smithy-celebrate-1.png'),
    require('../../assets/mascot/smithy-celebrate-2.png'),
  ],
};

const FRAME_MS: Record<MascotMood, number> = {
  idle: 500,
  charging: 280,
  thinking: 450,
  celebrate: 320,
};

/**
 * Smithy — static by default; set animated for event moments only.
 */
export function Mascot({ size = 96, mood = 'idle', animated = false }: Props) {
  const frames = FRAMES[mood];
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
    if (!animated || frames.length < 2) return;

    const id = setInterval(() => {
      setFrame((i) => (i + 1) % frames.length);
    }, FRAME_MS[mood]);

    return () => clearInterval(id);
  }, [mood, animated, frames.length]);

  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={frames[animated ? frame : 0]}
        style={[styles.img, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  img: {
    width: '100%',
    height: '100%',
  },
});
