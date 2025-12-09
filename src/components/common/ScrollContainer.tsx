import { getGlobalStyles } from '@styles/GlobalCss';
import { SIZE, useColor } from '@utils/Constant';
import React, { ReactNode, RefObject } from 'react';
import {
  Platform,
  StatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface ScrollContainerProps {
  children: ReactNode;
  header?: ReactNode;
  scrollStyle?: StyleProp<ViewStyle>;
  scrollRef?: RefObject<KeyboardAwareScrollView>;
  onScrolling?: () => void;
  keyboardShouldPersistTaps?: 'always' | 'handled' | 'never';
  isHideLine?: boolean;
  isBottomPadding?: Number;
  isPrimaryStatusColor?: boolean;
  isNoBottomSpace?: boolean;
  isNoSpace?: boolean;
  footer?: ReactNode;
  isEdgeValue?: 'top' | 'right' | 'bottom' | 'left';
  refreshControl?: any;
}
export const ScrollContainer = ({
  children,
  footer,
  scrollStyle,
  isBottomPadding,
  scrollRef,
  onScrolling,
  keyboardShouldPersistTaps = 'handled',
  isHideLine,
  header,
  isEdgeValue,
  isNoBottomSpace,
  isNoSpace,
  isPrimaryStatusColor,
  refreshControl,
}: ScrollContainerProps) => {
  const insets = useSafeAreaInsets();
  const COLOR = useColor();
  const GlobalStyles = getGlobalStyles(COLOR);
  const styles = getStyles(COLOR);

  return (
    <SafeAreaView
      style={[
        styles.mainContainer,

        {
          marginBottom:
            isBottomPadding > 0
              ? isBottomPadding - SIZE.moderateScale(15)
              : undefined,
          paddingBottom: isNoBottomSpace
            ? 0
            : Math.min(insets.bottom, Platform.OS === 'ios' ? 60 : 80),
        },
      ]}
      edges={isEdgeValue ? [isEdgeValue] : []}>
      <StatusBar
        backgroundColor={isPrimaryStatusColor ? COLOR.primary : COLOR.white}
        translucent={false}
        barStyle="dark-content"
      />

      {header && header}

      <View style={styles.scrollWrapper}>
        {!isHideLine && (
          <View style={[GlobalStyles.line, styles.fullWidthLine]} />
        )}
        <KeyboardAwareScrollView
          ref={scrollRef}
          enableOnAndroid
          extraScrollHeight={Platform.OS === 'ios' ? 60 : 0}
          extraHeight={Platform.OS === 'ios' ? 60 : 0}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            scrollStyle,
            {
              paddingHorizontal: SIZE.moderateScale(
                isNoSpace ? 0 : SIZE.moderateScale(10),
              ),
            },
          ]}
          scrollEventThrottle={16}
          refreshControl={refreshControl}
          onScroll={onScrolling}
          bounces={false}>
          {children}
        </KeyboardAwareScrollView>
        {footer && footer}
      </View>
    </SafeAreaView>
  );
};

const getStyles = (COLOR: ReturnType<typeof useColor>) =>
  StyleSheet.create({
    mainContainer: {
      backgroundColor: COLOR.white,
      flexGrow: 1,
    },
    scrollWrapper: {
      flex: 1,
      position: 'relative',
    },
    scrollContent: {
      flexGrow: 1,
    },
    fullWidthLine: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: SIZE.deviceWidth,
      zIndex: 1,
    },
  });
