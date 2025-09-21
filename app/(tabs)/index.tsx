// app/index.tsx
import React, { useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Constants
const { width } = Dimensions.get('window');
const CARD_SPACING = 20;
const CARD_PADDING = 20;
const CARD_WIDTH = (width - CARD_SPACING * 3) / 2;

// Types
interface CardData {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
}

// Card configuration
const CARD_CONFIG: CardData[] = [
  {
    key: 'doctor_call',
    icon: 'videocam',
    color: '#2E7D32',
    route: '/(tabs)/doctor-call'
  },
  {
    key: 'symptom_checker',
    icon: 'medical',
    color: '#1976D2',
    route: '/(tabs)/symptom-checker'
  },
  {
    key: 'medical_records',
    icon: 'document-text',
    color: '#66BB6A',
    route: '/(tabs)/medical-records'
  },
  {
    key: 'medicine_availability',
    icon: 'medical-outline',
    color: '#64B5F6',
    route: '/(tabs)/medicine'
  }
];

// Memoized Card Component for performance
const ActionCard = React.memo<{
  card: CardData;
  onPress: (route: string) => void;
  t: (key: string) => string;
}>(({ card, onPress, t }) => (
  <TouchableOpacity 
    style={[styles.card, { backgroundColor: card.color }]}
    onPress={() => onPress(card.route)}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={t(card.key)}
    accessibilityHint={`Navigate to ${t(card.key)}`}
  >
    <View style={styles.cardContent}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name={card.icon} 
          size={28} 
          color="white" 
        />
      </View>
      <Text style={styles.cardText} numberOfLines={2}>
        {t(card.key)}
      </Text>
    </View>
  </TouchableOpacity>
));

// Main Component
export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();

  // Memoized handlers for performance
  const handleCardPress = useCallback((route: string) => {
    router.push(route as any);
  }, [router]);

  const handleProfilePress = useCallback(() => {
    router.push('/(tabs)/profile' as any);
  }, [router]);

  // Memoized user name
  const userName = useMemo(() => 'Rajesh', []);

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#F9FAFB"
        translucent={false}
      />
      <SafeAreaView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcome}>
              {t('welcome', { name: userName })}
            </Text>
            <Text style={styles.subtitle}>
              {t('how_can_i_help')}
            </Text>
          </View>
          
          {/* Profile Button */}
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={handleProfilePress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Profile"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="person-circle" size={32} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.grid}>
          {CARD_CONFIG.map((card) => (
            <ActionCard
              key={card.key}
              card={card}
              onPress={handleCardPress}
              t={t}
            />
          ))}
        </View>

        {/* Quick Stats or Recent Activity */}
        <View style={styles.quickStats}>
          <Text style={styles.quickStatsTitle}>Quick Access</Text>
          <View style={styles.quickStatsRow}>
            <TouchableOpacity style={styles.quickStatItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.quickStatText}>Recent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickStatItem}>
              <Ionicons name="bookmark-outline" size={16} color="#666" />
              <Text style={styles.quickStatText}>Saved</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickStatItem}>
              <Ionicons name="notifications-outline" size={16} color="#666" />
              <Text style={styles.quickStatText}>Alerts</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

// Optimized StyleSheet
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: CARD_PADDING,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    backgroundColor: '#F9FAFB' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingTop: 10
  },
  welcomeContainer: {
    flex: 1
  },
  welcome: { 
    fontSize: 26, 
    fontWeight: '700', 
    marginBottom: 6,
    color: '#1A1A1A',
    letterSpacing: -0.5
  },
  subtitle: { 
    color: '#616161', 
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22
  },
  profileButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    marginBottom: 24
  },
  card: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  iconContainer: {
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    padding: 12
  },
  cardText: { 
    color: 'white', 
    fontWeight: '600', 
    fontSize: 14, 
    textAlign: 'center',
    lineHeight: 18
  },
  quickStats: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quickStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  quickStatItem: {
    alignItems: 'center',
    padding: 8
  },
  quickStatText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500'
  }
});
