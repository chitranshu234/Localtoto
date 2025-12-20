import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
    title: string | React.ReactNode;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
    style?: ViewStyle;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', style, disabled }) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                variant === 'secondary' ? styles.secondaryContainer : styles.primaryContainer,
                style,
                disabled && styles.disabledContainer,
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            {typeof title === 'string' ? (
                <Text
                    style={[
                        styles.text,
                        variant === 'secondary' ? styles.secondaryText : styles.primaryText,
                    ]}
                >
                    {title}
                </Text>
            ) : (
                title
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    primaryContainer: {
        backgroundColor: '#219653', // Green background
        borderWidth: 0,
        borderRadius: 12,
    },
    secondaryContainer: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: '#F2C94C', // Yellowish color from design
        textDecorationLine: 'underline',
    },
    disabledContainer: {
        opacity: 0.5,
    },
});

export default Button;
