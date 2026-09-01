import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PropertiesScreen from '../screens/PropertiesScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import TourismScreen from '../screens/TourismScreen';
import BusinessScreen from '../screens/BusinessScreen';
import MaterialsScreen from '../screens/MaterialsScreen';
import MoversScreen from '../screens/MoversScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MessagesScreen from '../screens/MessagesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import WalletScreen from '../screens/WalletScreen';
import SavedScreen from '../screens/SavedScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#fbbf24',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#0f1729',
          borderTopColor: '#1e293b',
          borderTopWidth: 1,
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#0f1729',
          borderBottomColor: '#1e293b',
          borderBottomWidth: 1,
        },
        headerTintColor: '#fbbf24',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Properties"
        component={PropertiesScreen}
        options={{ title: 'Properties' }}
      />
      <Tab.Screen
        name="Tourism"
        component={TourismScreen}
        options={{ title: 'Tourism' }}
      />
      <Tab.Screen
        name="Business"
        component={BusinessScreen}
        options={{ title: 'Business' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0f1729',
            borderBottomColor: '#1e293b',
            borderBottomWidth: 1,
          },
          headerTintColor: '#fbbf24',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: {
            backgroundColor: '#0f1729',
          },
        }}
      >
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PropertyDetail"
              component={PropertyDetailScreen}
              options={{ title: 'Property Details' }}
            />
            <Stack.Screen
              name="Materials"
              component={MaterialsScreen}
              options={{ title: 'Materials' }}
            />
            <Stack.Screen
              name="Movers"
              component={MoversScreen}
              options={{ title: 'Movers' }}
            />
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'Dashboard' }}
            />
            <Stack.Screen
              name="Messages"
              component={MessagesScreen}
              options={{ title: 'Messages' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ title: 'Notifications' }}
            />
            <Stack.Screen
              name="Wallet"
              component={WalletScreen}
              options={{ title: 'Wallet' }}
            />
            <Stack.Screen
              name="Saved"
              component={SavedScreen}
              options={{ title: 'Saved Items' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function RootNavigator() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
