/* eslint-disable no-nested-ternary */
import { getGlobalStyles } from '@styles/GlobalCss';
import { SIZE, useColor } from '@utils/Constant';
import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  Dimensions,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

interface MainContainerProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  isHideLine?: boolean;
  isPrimaryStatusColor?: boolean;
  translucent?: boolean;
  isNoBottomSpace?: boolean;
  isNoSpace?: boolean;
  isEdgeValue?: String;
}

const { width: deviceWidth } = Dimensions.get('window');

export const MainContainer = ({
  children,
  style,
  isHideLine,
  isPrimaryStatusColor,
  isEdgeValue,
  isNoBottomSpace,
  translucent = false,
  isNoSpace = false,
}: MainContainerProps) => {
  const insets = useSafeAreaInsets();

  const COLOR = useColor();
  const GlobalStyles = getGlobalStyles(COLOR);
  const styles = getStyles(COLOR);
  return (
    <View style={styles.outerContainer}>
      <StatusBar
        backgroundColor={
          translucent
            ? 'transparent'
            : isPrimaryStatusColor
            ? COLOR.primary
            : COLOR.white
        }
        translucent={translucent}
        barStyle="dark-content"
      />
      {!isHideLine && (
        <View style={[styles.fullWidthLine, { backgroundColor: COLOR.lightGray }]} />
      )}
      <SafeAreaView
        style={[
          styles.mainContainer,
          {
            paddingBottom: isNoBottomSpace
              ? 0
              : Math.min(insets.bottom, Platform.OS === 'ios' ? 60 : 80),
            paddingHorizontal: SIZE.moderateScale(isNoSpace ? 0 : 10),
          },
          style,
        ]}
        edges={isEdgeValue ? [isEdgeValue] : []}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.container}>
            {children}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const getStyles = (COLOR: ReturnType<typeof useColor>) =>
  StyleSheet.create({
    outerContainer: {
      flex: 1,
      backgroundColor: COLOR.white,
    },
    container: {
      backgroundColor: COLOR.white,
      flex: 1,
      overflow: 'hidden',
    },
    mainContainer: {
      backgroundColor: COLOR.white,
      flex: 1,
    },
    flex: {
      flex: 1,
    },
    fullWidthLine: {
      width: deviceWidth,
      height: SIZE.moderateScale(1),
      backgroundColor: COLOR.lightGray,
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1000,
    },
  });