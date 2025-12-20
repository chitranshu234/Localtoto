import { getGlobalStyles } from '@styles/GlobalCss';
import { SIZE, useColor } from '@utils/Constant';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface IProps {
  title: string;
  height?: number;
  width?: number;
  style?: ViewStyle;
}

const HeaderAvatar: React.FC<IProps> = ({
  title,
  height = SIZE.moderateScale(40),
  width = SIZE.moderateScale(40),
  style,
}) => {
  const COLOR = useColor();
  const GlobalStyles = getGlobalStyles(COLOR);
  const styles = getStyles(COLOR, GlobalStyles);
  return (
    <View style={[styles.cardContainer, { height, width }, style]}>
      <Text style={styles.heading}>{title}</Text>
    </View>
  );
};

export default HeaderAvatar;

const getStyles = (COLOR: ReturnType<typeof useColor>, GlobalStyles: any) =>
  StyleSheet.create({
    cardContainer: {
      alignItems: 'center',
      backgroundColor: COLOR.error,
      borderRadius: SIZE.moderateScale(80),
      justifyContent: 'center',
    },
    heading: {
      ...GlobalStyles.textBold20,
      color: COLOR.white,
    },
  });
