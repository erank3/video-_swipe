import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import './global.css';

// Suppress known warnings from React Navigation on web
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (message, ...args) => {
    if (message.includes('props.pointerEvents is deprecated')) {
      return;
    }
    originalWarn.call(console, message, ...args);
  };
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}