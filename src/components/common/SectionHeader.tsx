import { getGlobalStyles } from '@styles/GlobalCss';
import { SIZE, useColor } from '@utils/Constant';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  buttonText?: string;
  onPress?: () => void;
  showSpacing?: boolean;
  containerStyle?: object;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  buttonText,
  onPress,
  showSpacing = false,
  containerStyle,
}) => {
  const COLOR = useColor();
  const GlobalStyles = getGlobalStyles(COLOR);
  const styles = getStyles(COLOR, GlobalStyles);
  return (
    <View
      style={[
        styles.sectionHeader,
        showSpacing && styles.sectionPadding,
        containerStyle,
      ]}>
      <Text style={GlobalStyles.textBold16}>{title}</Text>
      {buttonText && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.subTitle}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (COLOR: ReturnType<typeof useColor>, GlobalStyles: any) =>
  StyleSheet.create({
    sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: SIZE.moderateScale(10),
      paddingTop: SIZE.moderateScale(10),
    },
    sectionPadding: {
      paddingHorizontal: SIZE.moderateScale(10),
    },
    subTitle: {
      ...GlobalStyles.textSemiBold14,
      color: COLOR.primary,
    },
  });

export default SectionHeader;
