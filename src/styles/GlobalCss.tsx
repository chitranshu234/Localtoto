import { FONT_SIZE, FONTS, SIZE, useColor } from '@utils/Constant';
import { Platform } from 'react-native';

const textSemiBold12 = {
  fontFamily: FONTS.plusJakartaSansSemiBold,
  fontSize: FONT_SIZE.font12,
  lineHeight: SIZE.moderateScale(16),
};

const textRegular12 = {
  fontFamily: FONTS.plusJakartaSansRegular,
  fontSize: FONT_SIZE.font12,
  lineHeight: SIZE.moderateScale(16),
};

const textRegular14 = {
  fontFamily: FONTS.plusJakartaSansRegular,
  fontSize: FONT_SIZE.font14,
  lineHeight: SIZE.moderateScale(18),
};

const textBold18 = {
  fontFamily: FONTS.plusJakartaSansBold,
  fontSize: FONT_SIZE.font18,
  lineHeight: SIZE.moderateScale(26),
};

const textSemiBold10 = {
  fontFamily: FONTS.plusJakartaSansSemiBold,
  fontSize: FONT_SIZE.font10,
  lineHeight: SIZE.moderateScale(14),
};

const textSemiBold16 = {
  fontFamily: FONTS.plusJakartaSansSemiBold,
  fontSize: FONT_SIZE.font16,
  lineHeight: SIZE.moderateScale(24),
};

const textSemiBold20 = {
  fontFamily: FONTS.plusJakartaSansSemiBold,
  fontSize: FONT_SIZE.font20,
  lineHeight: SIZE.moderateScale(28),
};

const textBold14 = {
  fontFamily: FONTS.plusJakartaSansBold,
  fontSize: FONT_SIZE.font14,
  lineHeight: SIZE.moderateScale(19),
};

const textSemiBold14 = {
  fontFamily: FONTS.plusJakartaSansSemiBold,
  fontSize: FONT_SIZE.font14,
  lineHeight: SIZE.moderateScale(18),
};

export const getGlobalStyles = (COLOR: ReturnType<typeof useColor>) => ({
  bigLine: {
    backgroundColor: COLOR.grayLight,
    height: SIZE.moderateScale(6),
  },
  flexStyle: { flex: 1 },
  boldText: {
    ...textSemiBold12,
    color: COLOR.black,
    textTransform: 'capitalize',
  },
  borderHalfSize1: {
    borderColor: COLOR.borderColor,
    borderWidth: SIZE.moderateScale(1.5),
  },
  borderSize1: {
    borderColor: COLOR.borderColor,
    borderWidth: SIZE.moderateScale(1),
  },
  borderSize2: {
    borderColor: COLOR.borderColor,
    borderWidth: SIZE.moderateScale(2),
  },
  bottomSheetContainer: {
    borderTopLeftRadius: SIZE.moderateScale(20),
    borderTopRightRadius: SIZE.moderateScale(20),
    height: SIZE.moderateScale(300),
  },
  capitalizeTitle: {
    textTransform: 'capitalize',
  },
  capitalizeTitle1: {
    textTransform: 'capitalize',
  },
  cardContainer: {
    backgroundColor: COLOR.white,
    gap: SIZE.moderateScale(10),
    paddingVertical: SIZE.moderateScale(15),
  },
  cardContainerNew: {
    backgroundColor: COLOR.white,
    paddingBottom: SIZE.moderateScale(15),
  },
  categoryBtnText: {
    ...textSemiBold10,
    color: COLOR.primary,
    textTransform: 'capitalize',
  },
  categoryContainer: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLOR.primaryLight,
    borderRadius: SIZE.moderateScale(30),
    paddingHorizontal: SIZE.moderateScale(12),
    paddingVertical: SIZE.moderateScale(3),
  },
  container: {
    backgroundColor: COLOR.white,
    flex: 1,
  },
  containerMain: {
    backgroundColor: COLOR.white,
    flex: 1,
    paddingHorizontal: SIZE.moderateScale(10),
  },
  containerNoScroll: {
    backgroundColor: COLOR.white,
    flex: 1,
  },
  containerNoSpace: {
    backgroundColor: COLOR.white,
    flexGrow: 1,
  },
  countContainer: {
    alignItems: 'center',
    backgroundColor: COLOR.primaryLight100,
    borderColor: COLOR.borderColor,
    borderRadius: SIZE.moderateScale(20),
    borderWidth: SIZE.moderateScale(1),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZE.moderateScale(8),
    minWidth: SIZE.moderateScale(70),
    padding: SIZE.moderateScale(5),
  },
  descTitleTx: {
    ...textRegular14,
    color: COLOR.darkGrey,
    // textAlign: 'justify',
  },
  errorMessage: {
    color: COLOR.error,
    ...textRegular12,
    paddingHorizontal: SIZE.moderateScale(10),
    textAlign: 'left',
    width: '100%',
  },
  footerContainer: { marginVertical: SIZE.moderateScale(30) },
  headerTx: {
    ...textSemiBold16,
    color: COLOR.black,
    flex: 1,
  },
  infoTitle: {
    ...textRegular12,
    color: COLOR.darkGrey,
  },
  lightText: {
    ...textSemiBold12,
    color: COLOR.black,
    textTransform: 'capitalize',
  },
  line: {
    backgroundColor: COLOR.borderColor,
    height: SIZE.moderateScale(1),
  },
  mainContainer: { backgroundColor: COLOR.white, flex: 1 },
  messageText: {
    ...textRegular14,
    color: COLOR.black,
    paddingHorizontal: SIZE.moderateScale(20),
    paddingVertical: SIZE.moderateScale(5),
    textAlign: 'center',
  },
  minusContainer: {
    alignItems: 'center',
    borderColor: COLOR.borderColor,
    borderRadius: SIZE.moderateScale(20),
    borderWidth: SIZE.moderateScale(1),
    height: SIZE.moderateScale(23),
    justifyContent: 'center',
    width: SIZE.moderateScale(23),
  },
  plusContainer: {
    alignItems: 'center',
    backgroundColor: COLOR.primary,
    borderColor: COLOR.borderColor,
    borderRadius: SIZE.moderateScale(20),
    borderWidth: SIZE.moderateScale(1),
    height: SIZE.moderateScale(23),
    justifyContent: 'center',
    width: SIZE.moderateScale(23),
  },
  plusMinusText: {
    ...textRegular14,
    color: COLOR.black,
  },
  plusMinusText2: {
    ...textRegular14,
    color: COLOR.white,
  },
  plusMinusTextNew: {
    ...textRegular14,
    color: COLOR.black,
  },
  plusMinusTextNew2: {
    ...textRegular14,
    color: COLOR.white,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: SIZE.moderateScale(5),
  },
  rowLine: { alignItems: 'center', flexDirection: 'row' },
  scrollContainer: {
    flex: 1,
    paddingHorizontal:
      Platform.OS === 'ios' ? SIZE.moderateScale(20) : SIZE.moderateScale(0),
  },
  subContainer: {
    backgroundColor: COLOR.white,
    borderColor: COLOR.borderColor,
    borderRadius: SIZE.moderateScale(15),
    borderWidth: SIZE.moderateScale(1.5),
    gap: SIZE.moderateScale(10),
    marginBottom: SIZE.moderateScale(8),
    marginVertical: SIZE.moderateScale(5),

    paddingVertical: SIZE.moderateScale(15),
  },
  subTitleBoldTx: {
    ...textSemiBold12,
    color: COLOR.darkGrey,
  },
  subTitleTx: {
    ...textRegular12,
    color: COLOR.darkGrey,
  },
  textBold10: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansBold,
    fontSize: FONT_SIZE.font10,
    lineHeight: SIZE.moderateScale(14),
  },
  textBold12: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansBold,
    fontSize: FONT_SIZE.font12,
    lineHeight: SIZE.moderateScale(16),
  },
  textBold14: {
    ...textBold14,
    color: COLOR.black,
  },
  textBold16: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansBold,
    fontSize: FONT_SIZE.font16,
    lineHeight: SIZE.moderateScale(24),
  },
  textBold18: {
    ...textBold18,
    color: COLOR.black,
  },
  textBold20: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansBold,
    fontSize: FONT_SIZE.font20,
    lineHeight: SIZE.moderateScale(28),
  },
  textBold22: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansBold,
    fontSize: FONT_SIZE.font22,
    lineHeight: SIZE.moderateScale(30),
  },
  textBold26: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansBold,
    fontSize: FONT_SIZE.font26,
    lineHeight: SIZE.moderateScale(36),
  },
  textBold30: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansBold,
    fontSize: FONT_SIZE.font30,
    lineHeight: SIZE.moderateScale(42),
  },
  textMedium22: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansMedium,
    fontSize: FONT_SIZE.font22,
    lineHeight: SIZE.moderateScale(32),
  },
  textRegular10: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansRegular,
    fontSize: FONT_SIZE.font10,
    lineHeight: SIZE.moderateScale(14),
  },
  textRegular11: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansRegular,
    fontSize: FONT_SIZE.font11,
    lineHeight: SIZE.moderateScale(15),
  },
  textRegular12: {
    ...textRegular12,
    color: COLOR.black,
  },
  textRegular13: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansRegular,
    fontSize: FONT_SIZE.font13,
    lineHeight: SIZE.moderateScale(17),
  },
  textRegular14: {
    ...textRegular14,
    color: COLOR.black,
  },
  textRegular16: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansRegular,
    fontSize: FONT_SIZE.font16,
    lineHeight: SIZE.moderateScale(24),
  },
  textRegular18: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansRegular,
    fontSize: FONT_SIZE.font18,
    lineHeight: SIZE.moderateScale(26),
  },
  textRegular20: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansRegular,
    fontSize: FONT_SIZE.font20,
    lineHeight: SIZE.moderateScale(28),
  },
  textRegular22: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansRegular,
    fontSize: FONT_SIZE.font22,
    lineHeight: SIZE.moderateScale(30),
  },
  textSemiBold10: {
    ...textSemiBold10,
    color: COLOR.black,
  },
  textSemiBold11: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansSemiBold,
    fontSize: FONT_SIZE.font11,
    lineHeight: SIZE.moderateScale(15),
  },
  textSemiBold12: {
    ...textSemiBold12,
    color: COLOR.black,
  },
  textSemiBold13: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansSemiBold,
    fontSize: FONT_SIZE.font13,
    lineHeight: SIZE.moderateScale(17),
  },
  textSemiBold14: {
    ...textSemiBold14,
    color: COLOR.black,
  },
  textSemiBold15: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansSemiBold,
    fontSize: FONT_SIZE.font15,
    lineHeight: SIZE.moderateScale(20),
  },
  textSemiBold16: {
    ...textSemiBold16,
    color: COLOR.black,
  },
  textSemiBold18: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansSemiBold,
    fontSize: FONT_SIZE.font18,
    lineHeight: SIZE.moderateScale(26),
  },
  textSemiBold20: {
    ...textSemiBold20,
    color: COLOR.black,
  },
  textSemiBold22: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansSemiBold,
    fontSize: FONT_SIZE.font22,
    lineHeight: SIZE.moderateScale(30),
  },
  textSemiBold24: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansSemiBold,
    fontSize: FONT_SIZE.font20 + SIZE.moderateScale(4),
    lineHeight: SIZE.moderateScale(32),
  },
  titleInfo: {
    color: COLOR.black,
    fontFamily: FONTS.plusJakartaSansSemiBold,
    fontSize: FONT_SIZE.font17,
    lineHeight: SIZE.moderateScale(20),
  },
  titleText: {
    ...textBold18,
    color: COLOR.black,
    paddingVertical: SIZE.moderateScale(10),
    textAlign: 'center',
  },
  upperCaseTitle: {
    textTransform: 'uppercase',
  },
  wrapperStyle: {
    backgroundColor: COLOR.semiTransBlack,
  },
  walletBadge: {
    alignItems: 'center',
    backgroundColor: COLOR.green,
    borderColor: COLOR.borderColor,
    borderRadius: 6,
    borderWidth: 1,
    height: SIZE.moderateScale(18),
    justifyContent: 'center',
    minWidth: SIZE.moderateScale(48),
    position: 'absolute',
    right: SIZE.moderateScale(0),
    top: SIZE.moderateScale(3),
    zIndex: SIZE.moderateScale(100),
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.white,
    borderRadius: SIZE.moderateScale(7),
    paddingHorizontal: SIZE.moderateScale(2),
    paddingVertical: SIZE.moderateScale(2),
  },
  qtyFullContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLOR.white,
    // backgroundColor: COLOR.primary,
    borderRadius: SIZE.moderateScale(5),
    paddingHorizontal: SIZE.moderateScale(3),
    paddingVertical: SIZE.moderateScale(3),
    flex: 1,
    marginTop: SIZE.moderateScale(10),
  },
  qtyButton: {
    backgroundColor: COLOR.grayLight,
    borderRadius: SIZE.moderateScale(6),
    width: SIZE.moderateScale(24),
    height: SIZE.moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyListButton: {
    backgroundColor: COLOR.primary,
    // backgroundColor: COLOR.white,
    borderRadius: SIZE.moderateScale(6),
    width: SIZE.moderateScale(26),
    height: SIZE.moderateScale(26),
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtySymbol: {
    ...textBold14,
    color: COLOR.primary,
  },
  qtyText: {
    ...textSemiBold14,
    color: COLOR.black,
    minWidth: SIZE.moderateScale(24),
    textAlign: 'center',
  },
  qtyFullText: {
    ...textSemiBold14,
    color: COLOR.black,
    textAlign: 'center',
    flex: 1,
  },
});
