import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  HomeScreen,
  SeriesScreen,
  AchievementsScreen,
  VideoPlayerScreen,
  VideoFeedScreen,
} from '../screens';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for main screens
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#6b7280',
        headerStyle: styles.header,
        headerTintColor: 'white',
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Tab.Screen
        name="Feed"
        component={VideoFeedScreen}
        options={{
          tabBarLabel: 'FEED',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-circle" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Library"
        component={HomeScreen}
        options={{
          tabBarLabel: 'LIBRARY',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          tabBarLabel: 'ACHIEVEMENTS',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: styles.header,
          headerTintColor: 'white',
          headerTitleStyle: styles.headerTitle,
          cardStyle: { backgroundColor: '#0f0a3c' },
        }}
      >
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Series"
          component={SeriesScreen}
          options={{ title: 'SERIES DETAILS' }}
        />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayerScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1e1b4b',
    borderTopColor: '#374151',
    borderTopWidth: 2,
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  },
  header: {
    backgroundColor: '#1e1b4b',
    borderBottomWidth: 2,
    borderBottomColor: '#374151',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
