import { SIZE, useColor } from '@utils/Constant';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export const Loader = () => {
  const COLOR = useColor();
  const styles = getStyles();
  return (
    <View style={styles.mainView}>
      <ActivityIndicator size={'small'} color={COLOR.primary} />
    </View>
  );
};

const getStyles = () =>
  StyleSheet.create({
    mainView: {
      alignItems: 'center',
      height: SIZE.deviceHeight - SIZE.moderateScale(100),
      justifyContent: 'center',
      position: 'absolute',
      transform: [{ scale: 2 }],
      width: SIZE.deviceWidth,
      zIndex: 1,
    },
  });
