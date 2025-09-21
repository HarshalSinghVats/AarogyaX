// app/(tabs)/doctor-call.tsx
import React, { useState, useCallback, useEffect } from 'react';
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
  FlatList,
  Modal,
  ListRenderItem
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Type definitions
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  availability: string;
  consultationFee: string;
  avatar: string;
  languages: string[];
  nextSlot: string;
  isOnline: boolean;
}

interface Specialty {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// Mock doctors data - in real app, this would come from API
const DOCTORS_DATA: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    specialty: 'General Physician',
    experience: '8 years',
    rating: 4.8,
    reviews: 156,
    availability: 'Available Now',
    consultationFee: '₹500',
    avatar: 'https://via.placeholder.com/80x80/4CAF50/ffffff?text=PS',
    languages: ['English', 'Hindi', 'Punjabi'],
    nextSlot: '2:30 PM Today',
    isOnline: true
  },
  {
    id: '2',
    name: 'Dr. Rajesh Kumar',
    specialty: 'Cardiologist',
    experience: '12 years',
    rating: 4.9,
    reviews: 203,
    availability: 'Available in 30 min',
    consultationFee: '₹800',
    avatar: 'https://via.placeholder.com/80x80/2196F3/ffffff?text=RK',
    languages: ['English', 'Hindi'],
    nextSlot: '3:00 PM Today',
    isOnline: true
  },
  {
    id: '3',
    name: 'Dr. Simran Kaur',
    specialty: 'Pediatrician',
    experience: '6 years',
    rating: 4.7,
    reviews: 98,
    availability: 'Available Tomorrow',
    consultationFee: '₹600',
    avatar: 'https://via.placeholder.com/80x80/FF9800/ffffff?text=SK',
    languages: ['English', 'Punjabi'],
    nextSlot: '10:00 AM Tomorrow',
    isOnline: false
  },
  {
    id: '4',
    name: 'Dr. Amit Singh',
    specialty: 'Orthopedist',
    experience: '15 years',
    rating: 4.6,
    reviews: 187,
    availability: 'Available Now',
    consultationFee: '₹700',
    avatar: 'https://via.placeholder.com/80x80/9C27B0/ffffff?text=AS',
    languages: ['English', 'Hindi', 'Punjabi'],
    nextSlot: '2:45 PM Today',
    isOnline: true
  }
];

const SPECIALTIES: Specialty[] = [
  { id: 'all', name: 'All', icon: 'medical' },
  { id: 'general', name: 'General', icon: 'person' },
  { id: 'cardiology', name: 'Heart', icon: 'heart' },
  { id: 'pediatrics', name: 'Child', icon: 'happy' },
  { id: 'orthopedics', name: 'Bones', icon: 'body' }
];

export default function DoctorCall() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);

  // Force re-render when language changes
  useEffect(() => {
    const checkLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('language');
        if (savedLanguage && savedLanguage !== i18n.language) {
          await i18n.changeLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Language check failed:', error);
      }
    };
    checkLanguage();
  }, [i18n]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSpecialtySelect = useCallback((specialtyId: string) => {
    setSelectedSpecialty(specialtyId);
  }, []);

  const handleDoctorSelect = useCallback((doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  }, []);

  const handleBookCall = useCallback(() => {
    setShowBookingModal(false);
    if (selectedDoctor) {
      // Navigate to time slot selection
      router.push(`/(tabs)/book-appointment?doctorId=${selectedDoctor.id}` as any);
    }
  }, [selectedDoctor, router]);

  const handleInstantCall = useCallback(() => {
    setShowBookingModal(false);
    if (selectedDoctor) {
      // Navigate directly to call screen
      router.push(`/(tabs)/video-call?doctorId=${selectedDoctor.id}&type=instant` as any);
    }
  }, [selectedDoctor, router]);

  const renderSpecialtyItem: ListRenderItem<Specialty> = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.specialtyItem,
        selectedSpecialty === item.id && styles.specialtyItemActive
      ]}
      onPress={() => handleSpecialtySelect(item.id)}
    >
      <View style={[
        styles.specialtyIcon,
        selectedSpecialty === item.id && styles.specialtyIconActive
      ]}>
        <Ionicons 
          name={item.icon} 
          size={20} 
          color={selectedSpecialty === item.id ? '#fff' : '#666'} 
        />
      </View>
      <Text style={[
        styles.specialtyText,
        selectedSpecialty === item.id && styles.specialtyTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [selectedSpecialty, handleSpecialtySelect]);

  const renderDoctorCard: ListRenderItem<Doctor> = useCallback(({ item: doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => handleDoctorSelect(doctor)}
      activeOpacity={0.7}
    >
      <View style={styles.doctorHeader}>
        <View style={styles.doctorAvatarContainer}>
          <Image source={{ uri: doctor.avatar }} style={styles.doctorAvatar} />
          <View style={[
            styles.onlineIndicator,
            { backgroundColor: doctor.isOnline ? '#4CAF50' : '#ccc' }
          ]} />
        </View>
        
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
          <Text style={styles.doctorExperience}>{doctor.experience} {t('experience')}</Text>
        </View>

        <View style={styles.doctorRating}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{doctor.rating}</Text>
          </View>
          <Text style={styles.reviewsText}>({doctor.reviews})</Text>
        </View>
      </View>

      <View style={styles.doctorDetails}>
        <View style={styles.availabilityContainer}>
          <Ionicons 
            name="time-outline" 
            size={16} 
            color={doctor.isOnline ? '#4CAF50' : '#FF9800'} 
          />
          <Text style={[
            styles.availabilityText,
            { color: doctor.isOnline ? '#4CAF50' : '#FF9800' }
          ]}>
            {doctor.isOnline ? t('available_now') : doctor.availability}
          </Text>
        </View>

        <View style={styles.nextSlotContainer}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.nextSlotText}>{doctor.nextSlot}</Text>
        </View>
      </View>

      <View style={styles.doctorFooter}>
        <View style={styles.languagesContainer}>
          {doctor.languages.map((lang: string, index: number) => (
            <View key={index} style={styles.languageTag}>
              <Text style={styles.languageText}>{lang}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.feeContainer}>
          <Text style={styles.feeText}>{doctor.consultationFee}</Text>
          <Text style={styles.feeLabel}>{t('consultation_fee')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleDoctorSelect, t]);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('choose_doctor')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <TouchableOpacity style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#666" />
            <Text style={styles.searchPlaceholder}>{t('search_doctors')}</Text>
          </TouchableOpacity>
        </View>

        {/* Specialties Filter */}
        <View style={styles.specialtiesSection}>
          <FlatList
            data={SPECIALTIES}
            renderItem={renderSpecialtyItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specialtiesList}
          />
        </View>

        {/* Doctors List */}
        <FlatList
          data={DOCTORS_DATA}
          renderItem={renderDoctorCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.doctorsList}
          showsVerticalScrollIndicator={false}
        />

        {/* Booking Modal */}
        <Modal
          visible={showBookingModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowBookingModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {selectedDoctor && (
                <>
                  <View style={styles.modalHeader}>
                    <Image source={{ uri: selectedDoctor.avatar }} style={styles.modalDoctorAvatar} />
                    <View style={styles.modalDoctorInfo}>
                      <Text style={styles.modalDoctorName}>{selectedDoctor.name}</Text>
                      <Text style={styles.modalDoctorSpecialty}>{selectedDoctor.specialty}</Text>
                      <Text style={styles.modalConsultationFee}>{selectedDoctor.consultationFee}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.modalCloseButton}
                      onPress={() => setShowBookingModal(false)}
                    >
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalActions}>
                    {selectedDoctor.isOnline && (
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.instantCallButton]}
                        onPress={handleInstantCall}
                      >
                        <Ionicons name="videocam" size={20} color="#fff" />
                        <Text style={styles.instantCallText}>{t('start_call_now')}</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                      style={[styles.actionButton, styles.scheduleButton]}
                      onPress={handleBookCall}
                    >
                      <Ionicons name="calendar-outline" size={20} color="#6366F1" />
                      <Text style={styles.scheduleText}>{t('schedule_appointment')}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

// Styles remain the same as before...
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
    marginTop: 40,
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
  placeholder: {
    width: 40
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  searchPlaceholder: {
    marginLeft: 12,
    color: '#666',
    fontSize: 16
  },
  specialtiesSection: {
    backgroundColor: 'white',
    paddingBottom: 16
  },
  specialtiesList: {
    paddingHorizontal: 20
  },
  specialtyItem: {
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 8
  },
  specialtyItemActive: {
    // Active state handled by icon and text colors
  },
  specialtyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  specialtyIconActive: {
    backgroundColor: '#6366F1'
  },
  specialtyText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  specialtyTextActive: {
    color: '#6366F1',
    fontWeight: '600'
  },
  doctorsList: {
    padding: 20,
    paddingTop: 8
  },
  doctorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  doctorAvatarContainer: {
    position: 'relative',
    marginRight: 12
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0'
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white'
  },
  doctorInfo: {
    flex: 1,
    marginRight: 8
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6366F1',
    marginBottom: 2
  },
  doctorExperience: {
    fontSize: 12,
    color: '#666'
  },
  doctorRating: {
    alignItems: 'flex-end'
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 4
  },
  reviewsText: {
    fontSize: 12,
    color: '#666'
  },
  doctorDetails: {
    marginBottom: 16
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6
  },
  nextSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  nextSlotText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6
  },
  doctorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  languagesContainer: {
    flexDirection: 'row',
    flex: 1
  },
  languageTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6
  },
  languageText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500'
  },
  feeContainer: {
    alignItems: 'flex-end'
  },
  feeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A'
  },
  feeLabel: {
    fontSize: 10,
    color: '#666'
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 200
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  modalDoctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16
  },
  modalDoctorInfo: {
    flex: 1
  },
  modalDoctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4
  },
  modalDoctorSpecialty: {
    fontSize: 14,
    color: '#6366F1',
    marginBottom: 4
  },
  modalConsultationFee: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A'
  },
  modalCloseButton: {
    padding: 8
  },
  modalActions: {
    gap: 12
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8
  },
  instantCallButton: {
    backgroundColor: '#4CAF50'
  },
  instantCallText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  scheduleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#6366F1'
  },
  scheduleText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600'
  }
});
