import { SIZE, useColor } from '@utils/Constant';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

type Props = {
  selected: boolean;
  isCheckBox?: boolean;
  onSelect: () => void;
};

const CustomCheckBox: React.FC<Props> = ({
  selected,
  onSelect,
  isCheckBox = false,
}) => {
  let iconName = '';
  if (isCheckBox) {
    iconName = selected ? 'check-square' : 'square-o';
  } else {
    iconName = selected ? 'dot-circle-o' : 'circle-o';
  }
  const COLOR = useColor();
  const styles = getStyles();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onSelect}
      activeOpacity={0.7}>
      <Icon
        name={iconName}
        size={SIZE.moderateScale(22)}
        color={selected ? COLOR.primary : COLOR.lightGray}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

export default CustomCheckBox;

const getStyles = () =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingVertical: 10,
    },
    icon: {
      marginRight: 8,
    },
  });
