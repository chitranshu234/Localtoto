import { getGlobalStyles } from '@styles/GlobalCss';
import { SIZE, useColor } from '@utils/Constant';
import { goBack } from '@utils/NavigationUtil';
import React, { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';

interface InputBoxProps extends TextInputProps {
  iconName?: string;
  isPassword?: boolean;
  title?: string;
  isTitle?: boolean;
  isSearch?: boolean;
  titleTxStyle?: object;
  containerStyle?: object;
  inputTxStyle?: object;
  errorInfo?: string;
  onCrossPress?: () => void;
}

export const InputBox: React.FC<InputBoxProps> = ({
  iconName,
  isPassword = false,
  value,
  containerStyle,
  inputTxStyle,
  isTitle,
  title,
  titleTxStyle,
  errorInfo,
  isSearch,
  onCrossPress,
  multiline,
  ...props
}) => {
  const [focus, setFocus] = useState(false);
  const [hideTx, setHideTx] = useState(true);

  const COLOR = useColor();
  const GlobalStyles = getGlobalStyles(COLOR);
  const styles = getStyles(COLOR, GlobalStyles);
  const showHighlight = focus || (!!value && value.length > 0);
  let iconColor;

  if (isSearch) {
    iconColor = COLOR.darkGrey;
  } else if (showHighlight) {
    iconColor = COLOR.primary;
  } else {
    iconColor = COLOR.lightGray;
  }
  return (
    <View>
      {isTitle && <Text style={[styles.titleTx, titleTxStyle]}>{title}</Text>}
      <View
        style={[
          showHighlight ? styles.containerStyle : styles.inputContainer,
          containerStyle,
          multiline && styles.multilineContainer,
        ]}>
        {iconName && (
          <TouchableOpacity
          activeOpacity={1}
            onPress={() => {
              isSearch ;
            }}>
            <FeatherIcon
              name={iconName}
              size={23}
              color={iconColor}
              style={[
                styles.iconLeft,
                multiline && {
                  paddingTop: SIZE.moderateScale(10),
                },
              ]}
            />
          </TouchableOpacity>
        )}
        <TextInput
          style={[styles.titleStyle, inputTxStyle]}
          secureTextEntry={isPassword ? hideTx : false}
          onFocus={() => setFocus(true)}
          textAlignVertical="top"
          placeholderTextColor={COLOR.darkGrey}
          onBlur={() => setFocus(false)}
          value={value}
          {...props}
        />
        {isPassword && (
          <FeatherIcon
            onPress={() => {
              Keyboard.dismiss();
              setHideTx(!hideTx);
            }}
            name={hideTx ? 'eye' : 'eye-off'}
            size={18}
            color={showHighlight ? COLOR.primary : COLOR.lightGray}
            style={styles.iconRight}
          />
        )}
        {value?.length !== 0 && isSearch && (
          <IoniconsIcon
            onPress={() => {
              Keyboard.dismiss();
              onCrossPress?.();
            }}
            name={'close-circle'}
            size={SIZE.moderateScale(20)}
            color={COLOR.darkGrey}
            style={styles.iconRight}
          />
        )}
      </View>
      {errorInfo && <Text style={GlobalStyles.errorMessage}>{errorInfo}</Text>}
    </View>
  );
};

const getStyles = (COLOR: ReturnType<typeof useColor>, GlobalStyles) =>
  StyleSheet.create({
    containerStyle: {
      ...GlobalStyles.borderSize1,
      alignItems: 'center',
      borderColor: COLOR.borderColor,
      borderRadius: SIZE.moderateScale(10),
      flexDirection: 'row',
      height: 44,
      paddingHorizontal: SIZE.moderateScale(10),
    },
    iconLeft: {
      marginRight: SIZE.moderateScale(6),
    },
    iconRight: {
      marginLeft: SIZE.moderateScale(6),
    },
    inputContainer: {
      ...GlobalStyles.borderSize1,
      alignItems: 'center',
      borderRadius: SIZE.moderateScale(10),
      flexDirection: 'row',
      height: 44,
      paddingHorizontal: SIZE.moderateScale(10),
    },
    multilineContainer: {
      alignItems: 'flex-start',
      height: SIZE.moderateScale(70),
      paddingTop: SIZE.moderateScale(5),
    },
    titleStyle: {
      ...GlobalStyles.textRegular13,
      flex: 1,
      paddingHorizontal: SIZE.moderateScale(8),
    },
    titleTx: {
      ...GlobalStyles.textSemiBold13,
      alignSelf: 'flex-start',
      marginBottom: SIZE.moderateScale(8),
      marginHorizontal: SIZE.moderateScale(8),
      marginTop: SIZE.moderateScale(14),
      textTransform: 'capitalize',
    },
  });
