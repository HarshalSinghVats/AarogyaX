// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />

      {/* Hide doctor-call from tabs */}
      <Tabs.Screen
        name="doctor-call"
        options={{
          href: null, // This hides it from tabs
        }}
      />

      {/* Hide symptom-checker from tabs */}
      <Tabs.Screen
        name="symptom-checker"
        options={{
          href: null, // This hides it from tabs
        }}
      />
      <Tabs.Screen
        name="medicine"
        options={{
          href: null, // This hides it from tabs
        }}
      />
      <Tabs.Screen
        name="medical-records"
        options={{
          href: null, // This hides it from tabs
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
