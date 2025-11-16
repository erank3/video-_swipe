import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ViewStyle } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  color = '#6366f1',
  backgroundColor = '#1e1b4b',
  height = 20,
  animated = true,
  style
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(progress);
    }
  }, [progress, animated]);
  
  return (
    <View style={style}>
      {label && (
        <Text style={{ 
          color: 'white', 
          marginBottom: 4, 
          fontSize: 14,
          fontWeight: '600' 
        }}>
          {label}
        </Text>
      )}
      <View
        style={{
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: color,
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: color,
            borderRadius: height / 2,
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
          }}
        />
        {showPercentage && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 12,
                fontWeight: 'bold',
                textShadowColor: 'rgba(0, 0, 0, 0.75)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {Math.round(progress)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
