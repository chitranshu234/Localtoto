import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PaginationProps {
    total: number;
    currentIndex: number;
}

const Pagination: React.FC<PaginationProps> = ({ total, currentIndex }) => {
    return (
        <View style={styles.container}>
            {Array.from({ length: total }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        index === currentIndex ? styles.activeDot : styles.inactiveDot,
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        width: 24,
        backgroundColor: '#FFFFFF', // Active dot color (White)
    },
    inactiveDot: {
        width: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.4)', // Inactive dot color (Semi-transparent white)
    },
});

export default Pagination;
