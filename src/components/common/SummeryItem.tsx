import { getGlobalStyles } from '@styles/GlobalCss';
import { SIZE, useColor } from '@utils/Constant';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RowProps {
  title: string;
  price: number;
  isGreen?: Boolean;
}

const SummeryItem: React.FC<RowProps> = ({ title, price, isGreen }) => {
  const COLOR = useColor();
  const GlobalStyles = getGlobalStyles(COLOR);
  const styles = getStyles(COLOR, GlobalStyles);
  return (
    <View style={styles.row}>
      {title !== 'Total' && (
        <Text style={[styles.title, isGreen && { color: COLOR.green }]}>
          {title}
        </Text>
      )}
      {title === 'Total' && <Text style={styles.totalTitle}>{title}</Text>}
      <Text
        style={[
          GlobalStyles.textSemiBold14,
          title === 'Total' && GlobalStyles.textBold14,
          (isGreen || price === 'Free') && { color: COLOR.green },
        ]}>
        {price === 'Free' ? `${price}` : `₹ ${price}`}
      </Text>
    </View>
  );
};

const getStyles = (COLOR: ReturnType<typeof useColor>, GlobalStyles) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: SIZE.moderateScale(4),
    },
    title: {
      ...GlobalStyles.textRegular14,
      color: COLOR.darkGrey,
      flex: 1,
    },
    totalTitle: {
      ...GlobalStyles.textBold14,
      color: COLOR.black,
    },
  });

export default SummeryItem;
