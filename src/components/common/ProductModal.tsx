import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SIZE, useColor } from '@utils/Constant';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const GroceryModal: React.FC<Props> = ({ visible, onClose }) => {
  const COLOR = useColor();

  const items = [
    {
      id: '1',
      image: 'https://i.imgur.com/0ZQnFQK.png',
      quantity: 'Aashirvaad Atta – 1 kg',
      price: 54,
      strikePrice: 65,
      discount: '17% OFF',
    },
    {
      id: '2',
      image: 'https://i.imgur.com/2eQ7VtG.png',
      quantity: 'Tata Salt – 1 kg',
      price: 28,
    },
    {
      id: '3',
      image: 'https://i.imgur.com/YqE2R5q.png',
      quantity: 'Amul Toned Milk – 1 L',
      price: 67,
    },
    {
      id: '4',
      image: 'https://i.imgur.com/uCBXx4j.png',
      quantity: 'Fortune Basmati Rice – 5 kg Bag',
      price: 246,
      strikePrice: 299,
      discount: '18% OFF',
    },
    {
      id: '5',
      image: 'https://i.imgur.com/3z0BM8b.png',
      quantity: 'Refined Sugar – 2 kg Pack',
      price: 102,
      strikePrice: 118,
      discount: '14% OFF',
      isSoldOut: true,
    },
    {
      id: '6',
      image: 'https://i.imgur.com/MPgGIrK.png',
      quantity: 'Chana Dal – 1 kg',
      price: 64,
      strikePrice: 79,
      discount: '19% OFF',
      isSoldOut: true,
    },
  ];

  const styles = getStyles(COLOR);

  return (
    <Modal transparent visible={visible} animationType="slide">
      {/* Dark Backdrop */}
      <View style={styles.backdrop}>
        {/* Floating Close Button */}
        <TouchableOpacity onPress={onClose} style={styles.floatingClose}>
          <Feather name="x" size={SIZE.moderateScale(26)} color={COLOR.black} />
        </TouchableOpacity>
      </View>

      {/* White Modal Content */}
      <View style={[styles.container]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>
            Popular Grocery Packs — Best Prices on Everyday Essentials
          </Text>

          {items.map(item => (
            <View key={item.id} style={styles.card}>
              {/* IMAGE BLOCK */}
              <View style={styles.leftSection}>
                {item.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discount}</Text>
                  </View>
                )}

                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                />
              </View>

              {/* Middle */}
              <View style={styles.middleSection}>
                <Text style={styles.quantity}>{item.quantity}</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{item.price}</Text>

                  {item.strikePrice && (
                    <Text style={styles.strike}>₹{item.strikePrice}</Text>
                  )}
                </View>
              </View>

              {/* ADD or Sold Out */}
              {!item.isSoldOut ? (
                <TouchableOpacity style={styles.addBtn}>
                  <Text style={styles.addText}>ADD</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.soldOut}>Sold out</Text>
              )}
            </View>
          ))}

          <View style={{ height: SIZE.moderateScale(40) }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const getStyles = (COLOR: ReturnType<typeof useColor>) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: COLOR.semiTransBlack,
      justifyContent: 'flex-end',
    },

    floatingClose: {
      position: 'absolute',
      top: SIZE.moderateScale(100),
      alignSelf: 'center',
      width: SIZE.moderateScale(50),
      height: SIZE.moderateScale(50),
      borderRadius: SIZE.moderateScale(29),
      backgroundColor: COLOR.extraLightGray,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: COLOR.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },

    container: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      maxHeight: '80%',
      borderTopLeftRadius: SIZE.moderateScale(26),
      borderTopRightRadius: SIZE.moderateScale(26),
      backgroundColor: COLOR.extraLightGray,
      paddingHorizontal: SIZE.moderateScale(18),
      paddingTop: SIZE.moderateScale(40),
    },

    title: {
      fontSize: SIZE.moderateScale(18),
      fontWeight: '700',
      marginBottom: SIZE.moderateScale(18),
      lineHeight: SIZE.moderateScale(22),
      color: COLOR.black,
    },

    card: {
      flexDirection: 'row',
      paddingVertical: SIZE.moderateScale(12),
      paddingHorizontal: SIZE.moderateScale(12),
      borderRadius: SIZE.moderateScale(14),
      backgroundColor: COLOR.white,
      borderWidth: 1,
      borderColor: COLOR.borderColor,
      shadowColor: COLOR.black,
      shadowOpacity: 0.06,
      shadowRadius: SIZE.moderateScale(4),
      shadowOffset: {
        width: 0,
        height: SIZE.moderateScale(2),
      },
      elevation: 2,
      marginBottom: SIZE.moderateScale(10),
    },

    leftSection: {
      width: SIZE.moderateScale(70),
    },

    discountBadge: {
      position: 'absolute',
      top: SIZE.moderateScale(-4),
      left: SIZE.moderateScale(-4),
      backgroundColor: COLOR.green,
      paddingHorizontal: SIZE.moderateScale(6),
      paddingVertical: SIZE.moderateScale(2),
      borderRadius: SIZE.moderateScale(4),
      zIndex: 5,
    },

    discountText: {
      color: COLOR.white,
      fontWeight: '700',
      fontSize: SIZE.moderateScale(10),
    },

    productImage: {
      width: SIZE.moderateScale(55),
      height: SIZE.moderateScale(80),
      borderRadius: SIZE.moderateScale(8),
      borderWidth: 1,
      borderColor: COLOR.lightGray,
      resizeMode: 'contain',
    },

    middleSection: {
      flex: 1,
      paddingLeft: SIZE.moderateScale(10),
      justifyContent: 'center',
    },

    quantity: {
      fontSize: SIZE.moderateScale(14),
      fontWeight: '600',
      marginBottom: SIZE.moderateScale(4),
      color: COLOR.black,
    },

    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    price: {
      fontSize: SIZE.moderateScale(16),
      fontWeight: '700',
      color: COLOR.black,
    },

    strike: {
      marginLeft: SIZE.moderateScale(8),
      color: COLOR.darkGrey,
      textDecorationLine: 'line-through',
      fontSize: SIZE.moderateScale(13),
    },

    addBtn: {
      borderWidth: SIZE.moderateScale(1.5),
      borderColor: COLOR.green,
      borderRadius: SIZE.moderateScale(8),
      paddingVertical: SIZE.moderateScale(5),
      paddingHorizontal: SIZE.moderateScale(14),
      alignSelf: 'center',
    },

    addText: {
      color: COLOR.green,
      fontWeight: '700',
      fontSize: SIZE.moderateScale(12),
    },

    soldOut: {
      color: COLOR.darkGrey,
      fontWeight: '700',
      alignSelf: 'center',
      fontSize: SIZE.moderateScale(12),
    },
  });

export default GroceryModal;
