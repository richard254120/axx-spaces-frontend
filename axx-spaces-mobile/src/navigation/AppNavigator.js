import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import WebViewScreen from '../screens/WebViewScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: {
            backgroundColor: '#0f1729',
          },
        }}
      >
        <Stack.Screen
          name="WebHome"
          component={WebViewScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
