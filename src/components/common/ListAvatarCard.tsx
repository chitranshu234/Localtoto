import { SIZE, useColor } from '@utils/Constant';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';

interface IProps {
  iconName: string;
  height?: number;
  width?: number;
}

const ListAvatarCard: React.FC<IProps> = ({
  iconName,
  height = 40,
  width = 40,
}) => {
  const dynamicStyle: ViewStyle = {
    height: SIZE.moderateScale(height),
    width: SIZE.moderateScale(width),
    borderRadius: SIZE.moderateScale(Math.min(height, width)) / 2,
  };
  const COLOR = useColor();
  const styles = getStyles(COLOR);
  return (
    <View style={[styles.cardContainer, dynamicStyle]}>
      <FeatherIcon name={iconName} size={22} color={COLOR.primary} />
    </View>
  );
};

export default ListAvatarCard;

const getStyles = (COLOR: ReturnType<typeof useColor>) =>
  StyleSheet.create({
    cardContainer: {
      alignItems: 'center',
      backgroundColor: COLOR.primaryLight,
      justifyContent: 'center',
    },
  });
