import React from 'react';
import { TouchableOpacity, Text, View, ViewStyle, TextStyle } from 'react-native';

interface GameButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const GameButton: React.FC<GameButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  icon
}) => {
  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 8,
    };
    
    // Size styles
    const sizeStyles = {
      small: { paddingVertical: 8, paddingHorizontal: 16 },
      medium: { paddingVertical: 12, paddingHorizontal: 24 },
      large: { paddingVertical: 16, paddingHorizontal: 32 },
    };
    
    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: '#6366f1',
        borderColor: '#8b5cf6',
      },
      secondary: {
        backgroundColor: '#1e1b4b',
        borderColor: '#6366f1',
      },
      accent: {
        backgroundColor: '#ec4899',
        borderColor: '#f472b6',
      },
      success: {
        backgroundColor: '#10b981',
        borderColor: '#34d399',
      },
    };
    
    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
      ...style,
    };
  };
  
  const getTextStyles = (): TextStyle => {
    const sizeStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };
    
    return {
      color: 'white',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      ...sizeStyles[size],
      ...textStyle,
    };
  };
  
  return (
    <TouchableOpacity
      style={getButtonStyles()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
      <Text style={getTextStyles()}>{title}</Text>
    </TouchableOpacity>
  );
};
