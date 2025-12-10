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
        backgroundColor: 'transparent', // Assuming the button might be on a green background or white, let's check designs.
        // Actually, looking at the design:
        // Location Screen: "Use current location" is Green with White text (or White with Green text if bg is green).
        // Wait, the Location screen background is Green.
        // "Use current location" button has a White border and Transparent background? Or maybe White background with Green text?
        // Let's look at the image `uploaded_image_1`.
        // "Use current location" -> Transparent background with White Border and White Text? Or maybe it's a gradient?
        // It looks like a button with a white border and white text.
        // "Select it manually" -> Yellow/Orange text, no background.

        // Onboarding Screen (uploaded_image_2):
        // "Confirm your driver" -> No button shown? Ah, there is a phone mock.
        // Wait, where is the "Next" button?
        // The design shows a pagination indicator at the bottom. Maybe it's swipe only?
        // Or maybe the "Next" button is hidden or not in the view?
        // The user said "make it as it is".

        // Let's re-examine `uploaded_image_1` (Location Screen).
        // Background: Green.
        // Button: "Use current location" -> Border: White, Text: White, Icon: Navigation Arrow.
        // Button: "Select it manually" -> Text: Yellow/Orange.

        // Let's implement based on that.
        borderWidth: 1,
        borderColor: '#FFFFFF',
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
