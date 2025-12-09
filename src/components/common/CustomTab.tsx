import { getGlobalStyles } from '@styles/GlobalCss';
import { FONTS, SIZE, useColor } from '@utils/Constant';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

type SegmentedControlProps = {
  options: string[];
  selectedOption: string;
  onOptionPress?: any;
};

// eslint-disable-next-line react/display-name
export const CustomTab: React.FC<SegmentedControlProps> = React.memo(
  ({ options, selectedOption, onOptionPress }: SegmentedControlProps) => {
    const segmentedControlWidth = SIZE.deviceWidth;
    const itemWidth =
      segmentedControlWidth /
      (options.length === 1 ? options.length + 1 : options.length);
    const rStyle = useAnimatedStyle(() => {
      return {
        left: withTiming(itemWidth * options.indexOf(selectedOption)),
      };
    }, [selectedOption, options, itemWidth]);
    const COLOR = useColor();
    const GlobalStyles = getGlobalStyles(COLOR);
    const styles = getStyles(COLOR, GlobalStyles);

    return (
      <View
        style={[
          styles.container,
          {
            width: options?.length === 1 ? itemWidth : SIZE.deviceWidth,
          },
        ]}>
        <Animated.View
          style={[
            {
              width: itemWidth,
            },
            rStyle,
            styles.activeBox,
          ]}
        />
        {options.map((data: string) => {
          return (
            <TouchableOpacity
              onPress={() => {
                onOptionPress?.(data);
              }}
              key={data}
              style={[
                {
                  width: itemWidth,
                },
                styles.labelContainer,
              ]}>
              <Text
                style={[
                  GlobalStyles.textSemiBold14,
                  styles.label,
                  {
                    width: itemWidth,
                  },
                ]}>
                {data}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  },
);

const getStyles = (COLOR: ReturnType<typeof useColor>, GlobalStyles) =>
  StyleSheet.create({
    activeBox: {
      ...GlobalStyles.borderSize2,
      alignItems: 'center',
      alignSelf: 'center',
      borderColor: COLOR.borderColor,
      bottom: SIZE.moderateScale(2),
      position: 'absolute',
    },
    container: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      height: 55,
      justifyContent: 'center',
      position: 'relative',
    },
    label: {
      color: COLOR.black,
      fontFamily: FONTS.plusJakartaSansSemiBold,
      textAlign: 'center',
    },
    labelContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
