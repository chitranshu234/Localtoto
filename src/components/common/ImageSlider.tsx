import { getGlobalStyles } from '@styles/GlobalCss';
import { ATTACHMENT_URL, SIZE, useColor } from '@utils/Constant';
import { navigate } from '@utils/NavigationUtil';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface Banner {
  banner_img: string;
  product_id?: string | null;
  brand_id?: string | null;
  category_id?: string | null;
  id?: string;
  showProduct?: boolean;
}

interface ImageSliderProps {
  bannerData: Banner[];
  autoScroll?: boolean;
  interval?: number;
}

const itemWidth = 350;
const spacing = 15;
const sidePadding = (screenWidth - itemWidth) / 3;
const BUFFER_SIZE = 15; 
const EXTEND_THRESHOLD = 2;

const ImageSlider: React.FC<ImageSliderProps> = ({
  bannerData,
  autoScroll = true,
  interval = 3000,
}) => {
  const scrollViewRef = useRef<FlatList<Banner>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dataSet, setDataSet] = useState<Banner[]>([]);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentDataSetIndexRef = useRef(0);
  const isJumpingRef = useRef(false);

  const COLOR = useColor();
  const GlobalStyles = getGlobalStyles(COLOR);
  const styles = getStyles(COLOR, GlobalStyles);

  const safeBannerData = useMemo(() => bannerData || [], [bannerData]);
  const totalItems = safeBannerData.length;
  const canAutoScroll = autoScroll && totalItems > 1;

  const progress = useSharedValue(0);


  useEffect(() => {
    if (totalItems > 0) {
      const initialData: Banner[] = [];
      for (let i = 0; i < BUFFER_SIZE; i++) {
        initialData.push(...safeBannerData);
      }
      setDataSet(initialData);
      const middleIndex = totalItems * Math.floor(BUFFER_SIZE / 2);
      currentDataSetIndexRef.current = middleIndex;

    
      setTimeout(() => {
        scrollViewRef.current?.scrollToOffset({
          offset: middleIndex * (itemWidth + spacing),
          animated: false,
        });
      }, 100);
    }
  }, [safeBannerData, totalItems]);

  const resetAutoScroll = useCallback(() => {
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
    cancelAnimation(progress);
  }, [progress]);

  const handleNextSlide = useCallback(() => {
    if (!canAutoScroll || totalItems <= 1) return;

    const nextGlobalIndex = currentDataSetIndexRef.current + 1;
    const nextVisualIndex = nextGlobalIndex % totalItems;

    scrollViewRef.current?.scrollToOffset({
      offset: nextGlobalIndex * (itemWidth + spacing),
      animated: true,
    });

    currentDataSetIndexRef.current = nextGlobalIndex;
    setCurrentIndex(nextVisualIndex);

    
    const currentCopyIndex = Math.floor(nextGlobalIndex / totalItems);
    const totalCopies = Math.floor(dataSet.length / totalItems);
    
   
    if (currentCopyIndex >= totalCopies - EXTEND_THRESHOLD) {
      setDataSet(prev => {
        const newData = [...prev, ...safeBannerData];
        
       
        if (newData.length > (BUFFER_SIZE + 2) * totalItems) {
          return newData.slice(totalItems);
        }
        return newData;
      });
    }
  }, [canAutoScroll, totalItems, dataSet.length, safeBannerData]);

  const startAutoScroll = useCallback(() => {
    resetAutoScroll();
    if (canAutoScroll) {
      cancelAnimation(progress);
      progress.value = 0;

      progress.value = withTiming(1, {
        duration: interval,
        easing: Easing.linear,
      });

      autoScrollTimerRef.current = setTimeout(() => {
        handleNextSlide();
        startAutoScroll();
      }, interval);
    }
  }, [canAutoScroll, interval, handleNextSlide, resetAutoScroll, progress]);

  useEffect(() => {
    if (canAutoScroll) {
      startAutoScroll();
    }
    return resetAutoScroll;
  }, [canAutoScroll, startAutoScroll, resetAutoScroll]);

  const handleScrollBegin = useCallback(() => {
    resetAutoScroll();
  }, [resetAutoScroll]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isJumpingRef.current) return;
      
      const offsetX = event.nativeEvent.contentOffset.x;
      const newGlobalIndex = Math.round(offsetX / (itemWidth + spacing));
      const newVisualIndex = newGlobalIndex % totalItems;

      currentDataSetIndexRef.current = newGlobalIndex;
      setCurrentIndex(newVisualIndex);

     
      const currentCopyIndex = Math.floor(newGlobalIndex / totalItems);
      const totalCopies = Math.floor(dataSet.length / totalItems);
      
      if (currentCopyIndex <= 1 || currentCopyIndex >= totalCopies - 2) {
        const middleCopy = Math.floor(totalCopies / 2);
        const middleIndex = middleCopy * totalItems + newVisualIndex;

        isJumpingRef.current = true;
        requestAnimationFrame(() => {
          scrollViewRef.current?.scrollToOffset({
            offset: middleIndex * (itemWidth + spacing),
            animated: false,
          });
          currentDataSetIndexRef.current = middleIndex;
          setTimeout(() => {
            isJumpingRef.current = false;
          }, 50);
        });
      }

      if (canAutoScroll) {
        cancelAnimation(progress);
        progress.value = 0;
        startAutoScroll();
      }
    },
    [totalItems, dataSet.length, canAutoScroll, startAutoScroll, progress],
  );

  const handleBannerPress = useCallback((item: Banner) => {
    if (item?.showProduct) {
      navigate('FestivalProductScreen', { bannerId: item?.id });
    } else {
      const params: Record<string, string> = {};
      if (item.product_id) params.productId = item.product_id;
      if (item.brand_id) params.brandId = item.brand_id;
      if (item.category_id) params.categoryId = item.category_id;
      navigate('Product', params);
    }
  }, []);

 
  const renderIndicators = useMemo(() => {
    if (totalItems <= 1) return null;
    const total = totalItems;
    const visibleLimit = total > 5 ? 5 : total;
    const sideDots = Math.floor((visibleLimit - 1) / 2);
    const indicators = [];

    for (let i = 0; i < sideDots; i++) {
      indicators.push(<View key={`left-${i}`} style={styles.indicator} />);
    }

    indicators.push(
      <View key="center" style={[styles.indicator, styles.activeIndicator]}>
        <Text style={styles.counterText}>
          {currentIndex + 1}/{totalItems}
        </Text>
      </View>,
    );

    for (let i = 0; i < sideDots; i++) {
      indicators.push(<View key={`right-${i}`} style={styles.indicator} />);
    }

    return indicators;
  }, [currentIndex, totalItems, styles]);

  if (totalItems === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={scrollViewRef}
        data={dataSet}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(_, index) => `banner-${index}`}
        snapToInterval={itemWidth + spacing}
        decelerationRate="fast"
        disableIntervalMomentum={true}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: itemWidth + spacing,
          offset: (itemWidth + spacing) * index,
          index,
        })}
        contentContainerStyle={{ paddingHorizontal: sidePadding }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleBannerPress(item)}
            style={styles.imageContainer}>
            <FastImage
              source={{
                uri: `${ATTACHMENT_URL}${item.banner_img}`,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.stretch}
            />
          </TouchableOpacity>
        )}
      />
      {totalItems > 1 && (
        <View style={styles.rowIndicatorContainer}>{renderIndicators}</View>
      )}
    </View>
  );
};

const getStyles = (COLOR: ReturnType<typeof useColor>, GlobalStyles: any) =>
  StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', width: '100%' },
    imageContainer: {
      borderRadius: SIZE.moderateScale(19),
      height: SIZE.moderateScale(230),
      marginRight: spacing,
      overflow: 'hidden',
      width: itemWidth,
    },
    image: {
      backgroundColor: COLOR.grayLight,
      height: SIZE.moderateScale(230),
      width: itemWidth,
    },
    indicator: {
      backgroundColor: COLOR.darkGrey,
      borderRadius: SIZE.moderateScale(4),
      height: SIZE.moderateScale(8),
      marginHorizontal: SIZE.moderateScale(3),
      width: SIZE.moderateScale(8),
    },
    activeIndicator: {
      alignItems: 'center',
      backgroundColor: COLOR.black,
      borderRadius: SIZE.moderateScale(20),
      flexDirection: 'row',
      height: SIZE.moderateScale(20),
      justifyContent: 'center',
      minWidth: SIZE.moderateScale(32),
      paddingVertical: SIZE.moderateScale(2),
    },
    counterText: {
      ...GlobalStyles.textBold10,
      color: COLOR.white,
    },
    rowIndicatorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingVertical: SIZE.moderateScale(15),
      width: '100%',
    },
  });

export default ImageSlider;