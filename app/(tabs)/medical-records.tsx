// app/(tabs)/medical-records.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface MedicalRecord {
  id: string;
  type: 'blood_test' | 'x_ray' | 'prescription' | 'consultation' | 'scan' | 'report';
  title: string;
  date: string;
  doctor: string;
  hospital: string;
  status: 'completed' | 'pending' | 'reviewed';
  fileSize: string;
  description: string;
}

// Mock medical records data
const MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: '1',
    type: 'blood_test',
    title: 'Complete Blood Count (CBC)',
    date: '2024-09-18',
    doctor: 'Dr. Priya Sharma',
    hospital: 'City Medical Center',
    status: 'completed',
    fileSize: '2.4 MB',
    description: 'Routine blood work including hemoglobin, white blood cells, and platelet count'
  },
  {
    id: '2',
    type: 'prescription',
    title: 'Prescription - Hypertension',
    date: '2024-09-15',
    doctor: 'Dr. Rajesh Kumar',
    hospital: 'Heart Care Clinic',
    status: 'reviewed',
    fileSize: '1.2 MB',
    description: 'Medication prescription for blood pressure management'
  },
  {
    id: '3',
    type: 'x_ray',
    title: 'Chest X-Ray Report',
    date: '2024-09-10',
    doctor: 'Dr. Amit Singh',
    hospital: 'Diagnostic Center',
    status: 'completed',
    fileSize: '5.8 MB',
    description: 'Chest X-ray examination for respiratory health assessment'
  }
];

export default function MedicalRecords() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);

  // Language detection
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

  const handleDownloadLatest = useCallback(async () => {
    setIsDownloading(true);
    
    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false);
      Alert.alert(
        t('download_complete'),
        t('download_complete_msg'),
        [
          { text: t('view_file'), onPress: () => {
            // Navigate to file viewer
          }},
          { text: t('ok'), style: 'default' }
        ]
      );
    }, 2000);
  }, [t]);

  const handleRecordPress = useCallback((record: MedicalRecord) => {
    Alert.alert(
      record.title,
      t('record_actions'),
      [
        { text: t('view'), onPress: () => {
          // Navigate to record viewer
        }},
        { text: t('download'), onPress: () => {
          // Download specific record
        }},
        { text: t('share'), onPress: () => {
          // Share record
        }},
        { text: t('cancel'), style: 'cancel' }
      ]
    );
  }, [t]);

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'blood_test': return 'water';
      case 'x_ray': return 'scan';
      case 'prescription': return 'medical';
      case 'consultation': return 'chatbubble-ellipses';
      case 'scan': return 'camera';
      case 'report': return 'document-text';
      default: return 'document';
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case 'blood_test': return '#e74c3c';
      case 'x_ray': return '#3498db';
      case 'prescription': return '#2ecc71';
      case 'consultation': return '#f39c12';
      case 'scan': return '#9b59b6';
      case 'report': return '#34495e';
      default: return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'reviewed': return '#2196F3';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return t('status_completed');
      case 'pending': return t('status_pending');
      case 'reviewed': return t('status_reviewed');
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('medical_records')}</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Latest Records Section */}
          <View style={styles.latestSection}>
            <View style={styles.latestCard}>
              <View style={styles.latestIconContainer}>
                <Ionicons name="cloud-download-outline" size={48} color="#6366F1" />
              </View>
              
              <Text style={styles.latestTitle}>{t('latest_records')}</Text>
              <Text style={styles.latestSubtitle}>
                {t('latest_records_desc')}
              </Text>

              <TouchableOpacity
                style={[
                  styles.downloadButton,
                  isDownloading && styles.downloadButtonDisabled
                ]}
                onPress={handleDownloadLatest}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="download-outline" size={20} color="#fff" />
                )}
                <Text style={styles.downloadButtonText}>
                  {isDownloading ? t('downloading') : t('download_latest_records')}
                </Text>
              </TouchableOpacity>

              <Text style={styles.lastUpdated}>
                {t('last_updated')}: {formatDate('2024-09-18')}
              </Text>
            </View>
          </View>

          {/* Recent Records History */}
          <View style={styles.historySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('recent_records')}</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>{t('view_all')}</Text>
              </TouchableOpacity>
            </View>

            {MEDICAL_RECORDS.map((record, index) => (
              <TouchableOpacity
                key={record.id}
                style={styles.recordCard}
                onPress={() => handleRecordPress(record)}
                activeOpacity={0.7}
              >
                <View style={styles.recordHeader}>
                  <View style={[
                    styles.recordIconContainer,
                    { backgroundColor: `${getRecordColor(record.type)}20` }
                  ]}>
                    <Ionicons 
                      name={getRecordIcon(record.type) as any} 
                      size={24} 
                      color={getRecordColor(record.type)} 
                    />
                  </View>

                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{record.title}</Text>
                    <Text style={styles.recordDoctor}>{record.doctor}</Text>
                    <Text style={styles.recordHospital}>{record.hospital}</Text>
                  </View>

                  <View style={styles.recordMeta}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(record.status) }
                    ]}>
                      <Text style={styles.statusText}>
                        {getStatusText(record.status)}
                      </Text>
                    </View>
                    <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
                  </View>
                </View>

                <Text style={styles.recordDescription} numberOfLines={2}>
                  {record.description}
                </Text>

                <View style={styles.recordFooter}>
                  <View style={styles.fileSizeContainer}>
                    <Ionicons name="document-outline" size={14} color="#666" />
                    <Text style={styles.fileSizeText}>{record.fileSize}</Text>
                  </View>

                  <View style={styles.recordActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="eye-outline" size={16} color="#6366F1" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="download-outline" size={16} color="#6366F1" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="share-outline" size={16} color="#6366F1" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
            
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionCard}>
                <Ionicons name="camera-outline" size={32} color="#4CAF50" />
                <Text style={styles.quickActionText}>{t('scan_document')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard}>
                <Ionicons name="cloud-upload-outline" size={32} color="#2196F3" />
                <Text style={styles.quickActionText}>{t('upload_record')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard}>
                <Ionicons name="share-outline" size={32} color="#FF9800" />
                <Text style={styles.quickActionText}>{t('share_with_doctor')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard}>
                <Ionicons name="settings-outline" size={32} color="#9C27B0" />
                <Text style={styles.quickActionText}>{t('privacy_settings')}</Text>
              </TouchableOpacity>
            </View>
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
  searchButton: {
    padding: 8
  },
  latestSection: {
    padding: 20
  },
  latestCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  latestIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  latestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center'
  },
  latestSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8
  },
  downloadButtonDisabled: {
    opacity: 0.7
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic'
  },
  historySection: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A'
  },
  viewAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500'
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  recordIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  recordInfo: {
    flex: 1,
    marginRight: 8
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4
  },
  recordDoctor: {
    fontSize: 14,
    color: '#6366F1',
    marginBottom: 2
  },
  recordHospital: {
    fontSize: 12,
    color: '#666'
  },
  recordMeta: {
    alignItems: 'flex-end'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600'
  },
  recordDate: {
    fontSize: 12,
    color: '#666'
  },
  recordDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12
  },
  recordFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  fileSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  fileSizeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4
  },
  recordActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500'
  }
});
