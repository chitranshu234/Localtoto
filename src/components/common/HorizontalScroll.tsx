import React from 'react';
import {
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { SIZE } from '@utils/Constant';

interface HorizontalImageScrollProps {
  data: string[]; // Array of image URLs
  onImagePress?: (imageUrl: string, index: number) => void;
  imageWidth?: number;
  imageHeight?: number;
  containerStyle?: any;
  imageStyle?: any;
  priority?: 'low' | 'normal' | 'high';
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  gap?: number;
}

const HorizontalImageScroll: React.FC<HorizontalImageScrollProps> = ({
  data,
  onImagePress,
  imageWidth = Dimensions.get('window').width * 0.25,
  imageHeight = SIZE.moderateScale(170),
  containerStyle,
  imageStyle,
  priority = 'high',
  resizeMode = 'cover',
  gap = 16,
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    return (
      <TouchableOpacity
        style={[
          styles.imageContainer,
          { width: imageWidth, height: imageHeight, marginRight: gap },
          containerStyle,
        ]}
        onPress={() => onImagePress?.(item, index)}
        activeOpacity={0.8}>
        <FastImage
          source={{
            uri: item,
            priority: FastImage.priority[priority],
          }}
          style={[styles.image, imageStyle]}
          resizeMode={FastImage.resizeMode[resizeMode]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={data}
      horizontal
      nestedScrollEnabled
      keyExtractor={(item, index) => `horizontal-image-${index}`}
      renderItem={renderItem}
      contentContainerStyle={styles.flatListContent}
      showsHorizontalScrollIndicator={false}
      snapToAlignment="start"
      decelerationRate="fast"
      snapToInterval={imageWidth + gap}
    />
  );
};

const styles = StyleSheet.create({
  flatListContent: {
    paddingHorizontal: SIZE.moderateScale(14),
  },
  imageContainer: {
    borderRadius: SIZE.moderateScale(10),
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default HorizontalImageScroll;
