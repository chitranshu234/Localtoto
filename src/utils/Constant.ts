import { RootState } from '@redux/store';
import { Dimensions, Platform } from 'react-native';
import { useSelector } from 'react-redux';


export interface AxiosErrorMessage {
  message: string;
}

export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PATCH: 'PATCH',
  PUT: 'PUT',
  DELETE: 'DELETE',
};


const { width, height } = Dimensions.get('screen');

const [shortDimension, longDimension] =
  width < height ? [width, height] : [height, width];

const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

export const scale = (size: number): number =>
  (shortDimension / guidelineBaseWidth) * size;

export const verticalScale = (size: number): number =>
  (longDimension / guidelineBaseHeight) * size;

export const moderateScale = (size: number, factor = 0.5): number => {
  const value = size + (scale(size) - size) * factor;
  return Platform.OS === 'android' ? Math.floor(value) : value;
};

export const moderateVerticalScale = (size: number, factor = 0.5): number => {
  const value = size + (verticalScale(size) - size) * factor;
  return Platform.OS === 'android' ? Math.floor(value) : value;
};

const isDeviceSize = (dim: any, sizes: number[]): boolean => {
  return sizes.includes(dim.height) || sizes.includes(dim.width);
};

const isIphoneX = (): boolean => {
  const dim = Dimensions.get('window');
  return Platform.OS === 'ios' && isDeviceSize(dim, [812, 896]);
};

const isIpad = (): boolean => {
  const dim = Dimensions.get('window');
  return Platform.OS === 'ios' && isDeviceSize(dim, [1024]);
};
 // Add this helper function at the top of your file
export const hexToRgb = (hex: string) => {
 
  hex = hex.replace(/^#/, '');
  
 
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
};
export const SIZE = {
  moderateScale,
  moderateVerticalScale,
  deviceWidth: width,
  deviceHeight: height,
  isIphoneX,
  isIpad,
};

export const FONTS = {
  plusJakartaSansBold: 'PlusJakartaSans-Bold',
  plusJakartaSansExtraBold: 'PlusJakartaSans-ExtraBold',
  plusJakartaSansItalic: 'PlusJakartaSans-Italic',
  plusJakartaSansLight: 'PlusJakartaSans-Light',
  plusJakartaSansMedium: 'PlusJakartaSans-Medium',
  plusJakartaSansRegular: 'PlusJakartaSans-Regular',
  plusJakartaSansSemiBold: 'PlusJakartaSans-SemiBold',
  plusJakartaSansExtraLight: 'PlusJakartaSans-ExtraLight',
};
export const FONT_SIZE = {
  font8: SIZE.moderateScale(8),
  font9: SIZE.moderateScale(9),
  font10: SIZE.moderateScale(10),
  font11: SIZE.moderateScale(11),
  font12: SIZE.moderateScale(12),
  font13: SIZE.moderateScale(13),
  font14: SIZE.moderateScale(14),
  font15: SIZE.moderateScale(15),
  font16: SIZE.moderateScale(16),
  font17: SIZE.moderateScale(17),
  font18: SIZE.moderateScale(18),
  font20: SIZE.moderateScale(20),
  font22: SIZE.moderateScale(22),
  font26: SIZE.moderateScale(26),
  font30: SIZE.moderateScale(30),
};

const hexToRGBA = (hex: string, alpha: number): string => {
  // Remove '#' if present

  if (hex) {
    hex = hex.replace('#', '');

    if (hex.length === 3) {
      // e.g. #abc → #aabbcc
      hex = hex
        .split('')
        .map(c => c + c)
        .join('');
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return `rgba(4, 120, 55,${0.5})`;
};

export const COLOR = {
  primary: '#227837',
  primaryLight: 'rgba(34, 120, 55, 0.2)',
  primaryLight200: 'rgba(34, 120, 55, 0.08)',
  primaryLight100: 'rgba(34, 120, 55, 0.05)',
  black: '#000000',
  lightBlack: '#303030ff',
  white: '#ffffff',
  white1: '#ffffff',
  lightGray: '#D3D3D3',
  darkGrey: '#8D8D8D',
  borderColor: '#cdcdcdff',
  grayLight: '#F2F2F2',
  extraLightGray: '#FAFAFA',
  lightDark: '#424D52',
  transparent: 'transparent',
  semiTransBlack: 'rgba(0,0,0,0.3)',
  colorLightGray: 'rgba(255, 255, 255, 0.7)',
  placeholderTransparent: 'rgba(255,255,255,0.3)',
  blackTransparent: 'rgba(0,0,0,0.1)',
  error: '#D60202',
  lightError: 'rgba(214, 2, 2, 0.1)',
  blue: '#007bff',
  orange: 'rgba(209, 121, 85,1)',
  orangeLight: 'rgba(209, 121, 85,.08)',
  green: 'rgba(34, 120, 55, 1)',
  lightGreen: 'rgba(34, 120, 55, 0.2)',
  lightRed: 'rgba(214, 2, 2, 0.2)',
  whatsAppGreen: 'rgba(37, 211, 102, 1)',
  whatsAppGreenLight: 'rgba(37, 211, 102, 0.2)',
  whatsAppGreenLight100: 'rgba(37, 211, 102, 0.08)',
};
export const useColor = () => {
  return {
    // Primary Colors
    primary: '#227837',
    primaryLight: 'rgba(34, 120, 55, 0.2)',
    primaryLight200: 'rgba(34, 120, 55, 0.08)',
    primaryLight100: 'rgba(34, 120, 55, 0.05)',

    // Base Colors
    black: '#000000',
    lightBlack: '#303030',
    white: '#FFFFFF',

    // Grays
    lightGray: '#D3D3D3',
    darkGrey: '#8D8D8D',
    borderColor: '#CDCDCD',
    grayLight: '#F2F2F2',
    extraLightGray: '#FAFAFA',

    // Utility Colors
    lightDark: '#424D52',
    transparent: 'transparent',
    semiTransBlack: 'rgba(0,0,0,0.3)',
    colorLightGray: 'rgba(255, 255, 255, 0.7)',
    placeholderTransparent: 'rgba(255,255,255,0.3)',
    blackTransparent: 'rgba(0,0,0,0.1)',

    // Status Colors
    error: '#D60202',
    lightError: 'rgba(214, 2, 2, 0.1)',
    lightRed: 'rgba(214, 2, 2, 0.2)',

    // Accent Colors
    blue: '#007bff',
    orange: 'rgba(209, 121, 85, 1)',
    orangeLight: 'rgba(209, 121, 85, 0.08)',
    green: 'rgba(34, 120, 55, 1)',
    lightGreen: 'rgba(34, 120, 55, 0.2)',

    // WhatsApp Variants
    whatsAppGreen: 'rgba(37, 211, 102, 1)',
    whatsAppGreenLight: 'rgba(37, 211, 102, 0.2)',
    whatsAppGreenLight100: 'rgba(37, 211, 102, 0.08)',
  };
};
