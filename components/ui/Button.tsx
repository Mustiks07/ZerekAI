import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  small?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

/**
 * ChunkyBtn / SoftBtn — Duolingo-style 3D button.
 * Matches дизайн.html ChunkyBtn component.
 */
export function Button({
  title, onPress, variant = 'primary', disabled = false,
  loading = false, fullWidth = true, small = false, style, textStyle, icon,
}: ButtonProps) {
  const variantStyles = getVariantStyles(variant);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        small && styles.small,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, small && styles.textSmall, { color: variantStyles.textColor }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function getVariantStyles(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: Colors.primary,
          borderBottomWidth: 4,
          borderBottomColor: Colors.primaryDark,
        } as ViewStyle,
        textColor: '#FFFFFF',
      };
    case 'accent':
      return {
        container: {
          backgroundColor: Colors.accent,
          borderBottomWidth: 4,
          borderBottomColor: Colors.accentDark,
        } as ViewStyle,
        textColor: '#FFFFFF',
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: '#fff',
          borderWidth: 2,
          borderColor: Colors.line,
          borderBottomWidth: 4,
          borderBottomColor: Colors.line,
        } as ViewStyle,
        textColor: Colors.ink,
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: Colors.line,
        } as ViewStyle,
        textColor: Colors.ink,
      };
    case 'danger':
      return {
        container: {
          backgroundColor: Colors.bad,
          borderBottomWidth: 4,
          borderBottomColor: '#C1121F',
        } as ViewStyle,
        textColor: '#FFFFFF',
      };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 16,
    gap: 8,
  },
  small: {
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  textSmall: {
    fontSize: 14,
  },
});
