import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

interface AvatarProps {
  uri?: string;
  size?: number;
  bg?: string;
}

/** Placeholder circle until real photo uploads are wired to Storage. A URI
 * renders as an actual image; without one it's a flat color circle so the
 * layout is still meaningful in the mock-data build. */
export function Avatar({ uri, size = 40, bg = colors.border }: AvatarProps) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (uri) {
    return <Image source={{ uri }} style={style} />;
  }
  return <View style={[style, { backgroundColor: bg }]} />;
}
