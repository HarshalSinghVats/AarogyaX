// app/profile.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// Update the import path to the correct location of your i18n configuration file
import { i18n, LANGUAGE_KEY } from '../../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// User data - in real app, this would come from your auth/state management
const USER_DATA = {
  name: 'Rajesh Kumar',
  email: 'rajesh@example.com',
  phone: '+91 98765 43210',
  bloodType: 'O+',
  dob: '15 March 1985',
  emergencyContact: '+91 87654 32109',
  avatar: 'https://via.placeholder.com/120x120/6366f1/ffffff?text=RK'
};

const MENU_ITEMS = [
  {
    id: 'medical_records',
    icon: 'document-text-outline',
    title: 'Medical Records',
    subtitle: 'View your health history',
    route: '/(tabs)/medical-records'
  },
  {
    id: 'appointments',
    icon: 'calendar-outline',
    title: 'My Appointments',
    subtitle: 'Upcoming & past visits',
    route: '/(tabs)/appointments'
  },
  {
    id: 'prescriptions',
    icon: 'medical-outline',
    title: 'Prescriptions',
    subtitle: 'Current medications',
    route: '/(tabs)/prescriptions'
  },
  {
    id: 'emergency',
    icon: 'shield-outline',
    title: 'Emergency Contacts',
    subtitle: 'Manage emergency info',
    route: '/(tabs)/emergency'
  },
  {
    id: 'notifications',
    icon: 'notifications-outline',
    title: 'Notifications',
    subtitle: 'Alerts & reminders',
    route: '/(tabs)/notifications'
  }
];

export default function Profile() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const changeLang = useCallback(async (lng: 'en' | 'pa') => {
    try {
      await i18n.changeLanguage(lng);
      await AsyncStorage.setItem(LANGUAGE_KEY, lng);
      setCurrentLanguage(lng);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, []);

  const handleMenuPress = useCallback((route: string) => {
    router.push(route as any);
  }, [router]);

  const handleEditProfile = useCallback(() => {
    router.push('/(tabs)/edit-profile' as any);
  }, [router]);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('profile')}</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="create-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: USER_DATA.avatar }} style={styles.avatar} />
              <View style={styles.statusIndicator} />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{USER_DATA.name}</Text>
              <Text style={styles.email}>{USER_DATA.email}</Text>
              <Text style={styles.phone}>{USER_DATA.phone}</Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>O+</Text>
                <Text style={styles.statLabel}>Blood Type</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>38</Text>
                <Text style={styles.statLabel}>Age</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Visits</Text>
              </View>
            </View>
          </View>

          {/* Language Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Language Preference</Text>
            <View style={styles.languageContainer}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  currentLanguage === 'en' && styles.languageButtonActive
                ]}
                onPress={() => changeLang('en')}
              >
                <Ionicons 
                  name="globe-outline" 
                  size={20} 
                  color={currentLanguage === 'en' ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.languageText,
                  currentLanguage === 'en' && styles.languageTextActive
                ]}>
                  {t('language_english')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.languageButton,
                  currentLanguage === 'pa' && styles.languageButtonActive
                ]}
                onPress={() => changeLang('pa')}
              >
                <Ionicons 
                  name="globe-outline" 
                  size={20} 
                  color={currentLanguage === 'pa' ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.languageText,
                  currentLanguage === 'pa' && styles.languageTextActive
                ]}>
                  {t('language_punjabi')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health & Settings</Text>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon as any} size={22} color="#666" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Emergency Contact Card */}
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyHeader}>
              <Ionicons name="alert-circle" size={24} color="#ff4444" />
              <Text style={styles.emergencyTitle}>Emergency Contact</Text>
            </View>
            <Text style={styles.emergencyContact}>{USER_DATA.emergencyContact}</Text>
            <Text style={styles.emergencyNote}>
              In case of medical emergency, this contact will be notified
            </Text>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appVersion}>Nabha Telemedicine v1.0.0</Text>
            <Text style={styles.appCopyright}>© 2025 Nabha Healthcare</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A'
  },
  editButton: {
    padding: 8
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0'
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: 'white'
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 24
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2
  },
  phone: {
    fontSize: 16,
    color: '#666'
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 12
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  languageButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1'
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8
  },
  languageTextActive: {
    color: 'white'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  menuContent: {
    flex: 1
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666'
  },
  emergencyCard: {
    backgroundColor: '#fff5f5',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginLeft: 8
  },
  emergencyContact: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8
  },
  emergencyNote: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  appInfo: {
    alignItems: 'center',
    paddingBottom: 40,
    marginTop: 20
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  appCopyright: {
    fontSize: 12,
    color: '#999'
  }
});
