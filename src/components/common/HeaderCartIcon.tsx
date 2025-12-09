import { selectCartItemsCount } from '@redux/slice/cartSlice';
import { commonSelector } from '@redux/slice/commonSlice';
import { getGlobalStyles } from '@styles/GlobalCss';
import { SIZE, useColor } from '@utils/Constant';
import { navigate } from '@utils/NavigationUtil';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import { shallowEqual, useSelector } from 'react-redux';

export const HeaderCartIcon = () => {
  const itemCount = useSelector(selectCartItemsCount, shallowEqual);
  const wallet = useSelector(commonSelector, shallowEqual);
  const COLOR = useColor();
  const GlobalStyles = getGlobalStyles(COLOR);
  const styles = getStyles(COLOR, GlobalStyles);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigate('CartScreen', {})}
        style={styles.iconButton}>
        <View style={styles.iconBackground}>
          <Feather name="shopping-bag" size={20} color={COLOR.black} />
          {itemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.iconButton, { marginLeft: SIZE.moderateScale(10) }]}
        onPress={() => {
          navigate('Wallet', {});
        }}>
        <View style={styles.iconBackground}>
          <IoniconsIcon name="wallet-outline" size={20} color={COLOR.black} />
        </View>
        <View
          style={[
            styles.waalletBadge,
            Math.round(wallet?.walletAmount ?? 0) < 200 && {
              backgroundColor: COLOR.error,
            },
          ]}>
          <Text style={styles.walletBadgeText}>
            ₹ {Math.round(wallet?.walletAmount ?? 0)}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (COLOR: ReturnType<typeof useColor>, GlobalStyles) =>
  StyleSheet.create({
    badge: {
      alignItems: 'center',
      backgroundColor: COLOR.primary,
      borderRadius: SIZE.moderateScale(999),
      height: SIZE.moderateScale(22),
      justifyContent: 'center',
      position: 'absolute',
      right: SIZE.moderateScale(-6),
      top: SIZE.moderateScale(-10),
      width: SIZE.moderateScale(22),
    },
    badgeText: {
      ...GlobalStyles.textSemiBold10,
      color: COLOR.white1,
      textAlign: 'center',
    },
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      marginRight: SIZE.moderateScale(10),
    },
    containerRight: {
      marginRight: SIZE.moderateScale(10),
    },
    iconBackground: {
      alignItems: 'center',
      backgroundColor: COLOR.grayLight,
      borderRadius: 10,
      height: 36,
      justifyContent: 'center',
      padding: SIZE.moderateScale(2),
      width: 38,
    },
    iconButton: {
      padding: SIZE.moderateScale(6),
    },
    waalletBadge: {
      alignItems: 'center',
      backgroundColor: COLOR.green,
      borderColor: COLOR.borderColor,
      borderRadius: 6,
      borderWidth: 1,
      height: SIZE.moderateScale(18),
      justifyContent: 'center',
      minWidth: SIZE.moderateScale(49),
      position: 'absolute',
      right: SIZE.moderateScale(0),
      top: SIZE.moderateScale(-3),
      zIndex: SIZE.moderateScale(100),
    },
    walletBadgeText: {
      ...GlobalStyles.textSemiBold10,
      color: COLOR.white1,
      textAlign: 'center',
    },
  });
