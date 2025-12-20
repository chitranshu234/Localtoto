import { clearRecentSearchString } from '@redux/slice/commonSlice';
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
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
type RecentSearchItemProps = {
  title: string;
  onPress: () => void;
};

const RecentSearchItem: React.FC<RecentSearchItemProps> = ({
  title,
  onPress,
}) => {
  const COLOR = useColor();
  const GlobalStyles = getGlobalStyles(COLOR);
  const styles = getStyles(COLOR);
  const dispatch = useDispatch();

  return (
    <TouchableOpacity style={styles.mainCard} onPress={onPress}>
      <View style={styles.leftContent}>
        <MaterialCommunityIcons
          name="history"
          size={SIZE.moderateScale(20)}
          color={COLOR.primary}
          style={styles.iconStyle}
        />
        <Text
          numberOfLines={1}
          style={[GlobalStyles.textSemiBold14, styles.titleText]}>
          {title}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          dispatch(clearRecentSearchString(title));
        }}>
        <Feather
          name="x"
          size={SIZE.moderateScale(20)}
          color={COLOR.darkGrey}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default RecentSearchItem;

const getStyles = (COLOR: ReturnType<typeof useColor>) =>
  StyleSheet.create({
    mainCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingVertical: SIZE.moderateScale(8),
      borderRadius: SIZE.moderateScale(8),
      paddingHorizontal: SIZE.moderateScale(10),
      backgroundColor: COLOR.extraLightGray,
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconStyle: {
      marginRight: SIZE.moderateScale(12),
    },
    titleText: {
      flex: 1,
    },
    closeButton: {
      padding: SIZE.moderateScale(4),
    },
  });
