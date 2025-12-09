import { getGlobalStyles } from '@styles/GlobalCss';
import { SIZE, useColor } from '@utils/Constant';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  btnContainerStyle?: ViewStyle;
  btnStyle?: ViewStyle;
  titleTxStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  btnContainerStyle,
  btnStyle,
  titleTxStyle,
  icon,
  iconPosition = 'left',
}) => {
  const COLOR = useColor();
  const GlobalStyles = getGlobalStyles(COLOR);
  const styles = getStyles(COLOR, GlobalStyles);
  return (
    <TouchableOpacity
      style={[
        styles.containerStyle,
        btnContainerStyle,
        btnStyle,
        disabled && styles.btnDisable,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <View style={styles.contentWrapper}>
        {icon && iconPosition === 'left' && (
          <View style={styles.iconWrapper}>{icon}</View>
        )}
        <Text
          style={[
            styles.titleStyle,
            titleTxStyle,
            disabled && styles.disableText,
            !!icon && styles.iconStyle,
          ]}>
          {title}
        </Text>
        {icon && iconPosition === 'right' && (
          <View style={styles.iconWrapper}>{icon}</View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (COLOR: ReturnType<typeof useColor>, GlobalStyles) =>
  StyleSheet.create({
    btnDisable: {
      backgroundColor: COLOR.primaryLight,
    },
    containerStyle: {
      alignSelf: 'center',
      backgroundColor: COLOR.primary,
      borderRadius: SIZE.moderateScale(10),
      paddingVertical: SIZE.moderateScale(8),
      width: '100%',
    },
    contentWrapper: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    disableText: {
      opacity: 0.6,
    },
    iconStyle: { marginHorizontal: 4 },
    iconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleStyle: {
      ...GlobalStyles.textSemiBold16,
      color: COLOR.white,
      textAlign: 'center',
    },
  });
