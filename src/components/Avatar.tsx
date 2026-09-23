import React from 'react';
import { Image, Text, View } from 'react-native';
import { colors } from '@/theme';

interface AvatarProps {
  uri?: string;
  size?: number;
  bg?: string;
}

const isImageSource = (uri: string) =>
  uri.startsWith('http') || uri.startsWith('file:') || uri.startsWith('data:') || uri.startsWith('content:');

/** Placeholder circle until real photo uploads are wired to Storage. A real
 * image URI renders as an actual photo; a short emoji string (from the
 * pick-an-avatar step) renders as text on a colored circle; with neither,
 * it's a flat color circle so the layout is still meaningful. */
export function Avatar({ uri, size = 40, bg = colors.border }: AvatarProps) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (uri && isImageSource(uri)) {
    return <Image source={{ uri }} style={style} />;
  }
  if (uri) {
    return (
      <View style={[style, { backgroundColor: bg, alignItems: 'center' as const, justifyContent: 'center' as const }]}>
        <Text style={{ fontSize: size * 0.5 }}>{uri}</Text>
      </View>
    );
  }
  return <View style={[style, { backgroundColor: bg }]} />;
}
