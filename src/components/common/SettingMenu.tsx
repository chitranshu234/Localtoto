import { getGlobalStyles } from '@styles/GlobalCss';
import { SIZE, useColor } from '@utils/Constant';
import { IMAGES } from '@utils/Images';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';

import CustomToggleSwitch from './CustomToggleSwitch';

interface RowProps {
  icon?: React.ReactNode;
  title: string;
  iconColor?: string;
  description?: string;
  index: number;
  onPress?: () => void;
  onTogglePress?: () => void;
  onWhatsAppPress?: () => void;
  onPhonePress?: () => void;
  isDelete?: boolean;
  isHideArrow?: boolean;
  isBoldDivider?: boolean;
  isRed?: boolean;
  isToggle?: boolean;
  isRightIcons?: boolean;
  setting?: boolean;
}

const SettingMenu: React.FC<RowProps> = ({
  icon,
  title,
  onPress,
  onTogglePress,
  onWhatsAppPress,
  onPhonePress,
  isDelete = false,
  isHideArrow = false,
  description,
  isBoldDivider = false,
  isToggle = false,
  isRed = false,
  isRightIcons = false,
  setting = false,
}) => {
  const COLOR = useColor();
  const GlobalStyles = getGlobalStyles(COLOR);
  const styles = getStyles(COLOR, GlobalStyles);
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.row, setting && styles.settingRow]}>
        {icon}
        <View
          style={[
            styles.titleContainer,
            icon != null && styles.titleIconStyle,
          ]}>
          <Text
            style={
             [ !description
                ? [GlobalStyles.textSemiBold14, isRed && { color: COLOR.error }]
                : GlobalStyles.textSemiBold14
           ,{color:COLOR.lightBlack}] }>
            {title}
          </Text>
        </View>
        {!isHideArrow && (
          <FeatherIcon
            name={'chevron-right'}
            size={20}
            color={isDelete ? COLOR.error : COLOR.black}
          />
        )}
        {isToggle && (
          <CustomToggleSwitch
            onValueChange={() => {
              onTogglePress();
            }}
          />
        )}
        {isRightIcons && (
          <View style={GlobalStyles.rowLine}>
            <TouchableOpacity onPress={onPhonePress}>
              <Image source={IMAGES.imgPhoneCall} style={styles.iconStyle} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onWhatsAppPress}
              style={styles.iconContainer}>
              <Image source={IMAGES.imgWhatsApp} style={styles.iconStyle} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (COLOR: ReturnType<typeof useColor>, GlobalStyles: any) =>
  StyleSheet.create({
    container: {
      borderWidth: 0.5,
      borderColor: COLOR.lightGray,
      borderRadius: SIZE.moderateScale(8),
      marginHorizontal: SIZE.moderateScale(10),
      marginBottom: SIZE.moderateScale(10),
    },
    iconContainer: {
      marginLeft: SIZE.moderateScale(10),
    },
    iconStyle: {
      borderRadius: SIZE.moderateScale(10),
      height: SIZE.moderateScale(21),
      width: SIZE.moderateScale(21),
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: SIZE.moderateScale(10),
      padding: SIZE.moderateScale(11),
      paddingRight: SIZE.moderateScale(10),
      borderWidth: 1,
      borderColor: COLOR.lightGray,
      borderRadius: SIZE.moderateScale(8),
      marginBottom: SIZE.moderateScale(10),
    },
    settingRow: {
      borderWidth: 0,
      borderBottomWidth: 1,
      borderRadius: 0,
      marginBottom: SIZE.moderateScale(4),
    },
    rowSubText: {
      ...GlobalStyles.textRegular13,
      color: COLOR.darkGrey,
      marginTop: SIZE.moderateScale(2),
    },
    titleContainer: {
      flex: 1,
    },
    titleIconStyle: {
      marginLeft: SIZE.moderateScale(5),
    },
  });

export default SettingMenu;
