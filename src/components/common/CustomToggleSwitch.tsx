import { SIZE, useColor } from '@utils/Constant';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  value: boolean;
  onValueChange: () => void;
};

const CustomToggleSwitch: React.FC<Props> = ({ value, onValueChange }) => {
  const COLOR = useColor();
  const styles = getStyles(COLOR);
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={[styles.switchContainer, value && styles.selectedContainer]}>
      <Animated.View style={[styles.knob, value && styles.knobSelected]} />
    </TouchableOpacity>
  );
};

export default CustomToggleSwitch;

const getStyles = (COLOR: ReturnType<typeof useColor>) =>
  StyleSheet.create({
    knob: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: COLOR.white,
      borderColor: COLOR.borderColor,
      borderRadius: SIZE.moderateScale(11),
      borderWidth: SIZE.moderateScale(0.1),
      elevation: 5,
      height: SIZE.moderateScale(17),
      justifyContent: 'center',
      shadowColor: COLOR.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3.84,
      width: SIZE.moderateScale(17),
    },
    knobSelected: {
      alignSelf: 'flex-end',
    },
    selectedContainer: {
      backgroundColor: COLOR.primary,
    },
    switchContainer: {
      backgroundColor: COLOR.lightGray,
      borderRadius: SIZE.moderateScale(20),
      height: SIZE.moderateScale(25),
      justifyContent: 'center',
      padding: SIZE.moderateScale(4),
      width: SIZE.moderateScale(45),
    },
  });
