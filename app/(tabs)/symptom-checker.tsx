// app/(tabs)/symptom-checker.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Types
interface Symptom {
  id: string;
  name: string;
  nameKey: string; // Add translation key
  severity: 'mild' | 'moderate' | 'severe';
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface Question {
  id: string;
  questionKey: string; // Add translation key
  type: 'boolean' | 'scale' | 'multiple';
  optionsKeys?: string[]; // Add translation keys for options
  answer?: any;
}

interface Diagnosis {
  conditionKey: string; // Add translation key
  probability: number;
  severity: 'low' | 'medium' | 'high';
  descriptionKey: string; // Add translation key
  recommendationsKeys: string[]; // Add translation keys
}

// Mock symptoms data with translation keys
const COMMON_SYMPTOMS: Symptom[] = [
  { id: '1', name: 'Fever', nameKey: 'fever', severity: 'moderate', category: 'general', icon: 'thermometer' },
  { id: '2', name: 'Headache', nameKey: 'headache', severity: 'mild', category: 'neurological', icon: 'person' },
  { id: '3', name: 'Cough', nameKey: 'cough', severity: 'mild', category: 'respiratory', icon: 'medical' },
  { id: '4', name: 'Sore Throat', nameKey: 'sore_throat', severity: 'mild', category: 'respiratory', icon: 'medical' },
  { id: '5', name: 'Chest Pain', nameKey: 'chest_pain', severity: 'severe', category: 'cardiovascular', icon: 'heart' },
  { id: '6', name: 'Nausea', nameKey: 'nausea', severity: 'moderate', category: 'digestive', icon: 'restaurant' },
  { id: '7', name: 'Fatigue', nameKey: 'fatigue', severity: 'mild', category: 'general', icon: 'battery-dead' },
  { id: '8', name: 'Dizziness', nameKey: 'dizziness', severity: 'moderate', category: 'neurological', icon: 'refresh-circle' },
  { id: '9', name: 'Shortness of Breath', nameKey: 'shortness_breath', severity: 'severe', category: 'respiratory', icon: 'fitness' },
  { id: '10', name: 'Stomach Pain', nameKey: 'stomach_pain', severity: 'moderate', category: 'digestive', icon: 'restaurant' }
];

// Mock AI questions with translation keys
const generateQuestions = (symptoms: Symptom[]): Question[] => {
  const baseQuestions: Question[] = [
    {
      id: '1',
      questionKey: 'symptom_duration',
      type: 'multiple',
      optionsKeys: ['less_24_hours', '1_3_days', '4_7_days', 'more_week']
    },
    {
      id: '2',
      questionKey: 'pain_level',
      type: 'scale'
    },
    {
      id: '3',
      questionKey: 'taken_medication',
      type: 'boolean'
    },
    {
      id: '4',
      questionKey: 'existing_conditions',
      type: 'boolean'
    },
    {
      id: '5',
      questionKey: 'current_medications',
      type: 'boolean'
    }
  ];

  return baseQuestions;
};

// Mock AI diagnosis with translation keys
const generateDiagnosis = (symptoms: Symptom[], answers: any[]): Diagnosis[] => {
  const diagnoses: Diagnosis[] = [
    {
      conditionKey: 'common_cold',
      probability: 75,
      severity: 'low',
      descriptionKey: 'common_cold_desc',
      recommendationsKeys: [
        'get_rest',
        'stay_hydrated',
        'otc_medicine',
        'monitor_symptoms'
      ]
    },
    {
      conditionKey: 'viral_infection',
      probability: 60,
      severity: 'medium',
      descriptionKey: 'viral_infection_desc',
      recommendationsKeys: [
        'rest_fluids',
        'monitor_temperature',
        'consult_if_worse',
        'avoid_contact'
      ]
    }
  ];

  return diagnoses;
};

export default function SymptomChecker() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'symptoms' | 'questions' | 'results'>('symptoms');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [diagnosis, setDiagnosis] = useState<Diagnosis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  const filteredSymptoms = COMMON_SYMPTOMS.filter(symptom =>
    t(symptom.nameKey).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBack = useCallback(() => {
    if (currentStep === 'questions' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentStep === 'questions') {
      setCurrentStep('symptoms');
    } else if (currentStep === 'results') {
      setCurrentStep('symptoms');
      setSelectedSymptoms([]);
      setAnswers([]);
      setCurrentQuestionIndex(0);
    } else {
      router.back();
    }
  }, [currentStep, currentQuestionIndex, router]);

  const handleSymptomToggle = useCallback((symptom: Symptom) => {
    setSelectedSymptoms(prev => {
      const exists = prev.find(s => s.id === symptom.id);
      if (exists) {
        return prev.filter(s => s.id !== symptom.id);
      } else {
        return [...prev, symptom];
      }
    });
  }, []);

  const handleStartAnalysis = useCallback(() => {
    if (selectedSymptoms.length === 0) {
      Alert.alert(t('no_symptoms'), t('select_symptoms_msg'));
      return;
    }
    
    const generatedQuestions = generateQuestions(selectedSymptoms);
    setQuestions(generatedQuestions);
    setCurrentStep('questions');
    setCurrentQuestionIndex(0);
    
    // Reset progress animation
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: (1 / generatedQuestions.length) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [selectedSymptoms, t, progressAnim]);

  const handleAnswer = useCallback((answer: any) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      Animated.timing(progressAnim, {
        toValue: ((currentQuestionIndex + 2) / questions.length) * 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Analysis complete
      setIsAnalyzing(true);
      setTimeout(() => {
        const results = generateDiagnosis(selectedSymptoms, newAnswers);
        setDiagnosis(results);
        setCurrentStep('results');
        setIsAnalyzing(false);
      }, 2000);
    }
  }, [currentQuestionIndex, questions.length, answers, selectedSymptoms, progressAnim]);

  const handleConsultDoctor = useCallback(() => {
    router.push('/(tabs)/doctor-call' as any);
  }, [router]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'severe': return '#f44336';
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#f44336';
      default: return '#666';
    }
  };

  const renderSymptomItem = ({ item }: { item: Symptom }) => {
    const isSelected = selectedSymptoms.some(s => s.id === item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.symptomCard,
          isSelected && styles.symptomCardSelected
        ]}
        onPress={() => handleSymptomToggle(item)}
      >
        <View style={[
          styles.symptomIcon,
          { backgroundColor: isSelected ? '#6366F1' : '#f8f9ff' }
        ]}>
          <Ionicons 
            name={item.icon} 
            size={24} 
            color={isSelected ? '#fff' : '#6366F1'} 
          />
        </View>
        <Text style={[
          styles.symptomName,
          isSelected && styles.symptomNameSelected
        ]}>
          {t(item.nameKey)}
        </Text>
        <View style={[
          styles.severityBadge,
          { backgroundColor: getSeverityColor(item.severity) }
        ]}>
          <Text style={styles.severityText}>
            {t(`severity_${item.severity}`)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{t(question.questionKey)}</Text>
        
        {question.type === 'boolean' && (
          <View style={styles.booleanOptions}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleAnswer(true)}
            >
              <Text style={styles.optionText}>{t('yes')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, styles.optionButtonSecondary]}
              onPress={() => handleAnswer(false)}
            >
              <Text style={[styles.optionText, styles.optionTextSecondary]}>{t('no')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {question.type === 'multiple' && question.optionsKeys && (
          <View style={styles.multipleOptions}>
            {question.optionsKeys.map((optionKey, index) => (
              <TouchableOpacity
                key={index}
                style={styles.multipleOptionButton}
                onPress={() => handleAnswer(optionKey)}
              >
                <Text style={styles.multipleOptionText}>{t(optionKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {question.type === 'scale' && (
          <View style={styles.scaleContainer}>
            <View style={styles.scaleNumbers}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <TouchableOpacity
                  key={num}
                  style={styles.scaleNumber}
                  onPress={() => handleAnswer(num)}
                >
                  <Text style={styles.scaleNumberText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabel}>{t('mild')}</Text>
              <Text style={styles.scaleLabel}>{t('severe')}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderResults = () => (
    <ScrollView style={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
        <Text style={styles.resultsTitle}>{t('analysis_complete')}</Text>
        <Text style={styles.resultsSubtitle}>
          {t('possible_conditions')}
        </Text>
      </View>

      {diagnosis.map((item, index) => (
        <View key={index} style={styles.diagnosisCard}>
          <View style={styles.diagnosisHeader}>
            <Text style={styles.diagnosisCondition}>{t(item.conditionKey)}</Text>
            <View style={[
              styles.probabilityBadge,
              { backgroundColor: getSeverityColor(item.severity) }
            ]}>
              <Text style={styles.probabilityText}>{item.probability}%</Text>
            </View>
          </View>
          
          <Text style={styles.diagnosisDescription}>{t(item.descriptionKey)}</Text>
          
          <Text style={styles.recommendationsTitle}>{t('recommendations')}:</Text>
          {item.recommendationsKeys.map((recKey, recIndex) => (
            <View key={recIndex} style={styles.recommendationItem}>
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
              <Text style={styles.recommendationText}>{t(recKey)}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.disclaimerCard}>
        <Ionicons name="warning" size={24} color="#FF9800" />
        <Text style={styles.disclaimerText}>
          {t('disclaimer')}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.consultButton}
        onPress={handleConsultDoctor}
      >
        <Ionicons name="videocam" size={20} color="#fff" />
        <Text style={styles.consultButtonText}>{t('consult_doctor')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentStep === 'symptoms' && t('symptom_checker')}
            {currentStep === 'questions' && t('health_assessment')}
            {currentStep === 'results' && t('your_results')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar for Questions */}
        {currentStep === 'questions' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%']
                  }) }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1} of {questions.length}
            </Text>
          </View>
        )}

        {/* Content */}
        {currentStep === 'symptoms' && (
          <View style={styles.symptomsContainer}>
            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder={t('search_symptoms')}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Selected Symptoms Count */}
            {selectedSymptoms.length > 0 && (
              <View style={styles.selectedCount}>
                <Text style={styles.selectedCountText}>
                  {selectedSymptoms.length} {t('symptoms_selected')}
                </Text>
              </View>
            )}

            {/* Symptoms Grid */}
            <FlatList
              data={filteredSymptoms}
              renderItem={renderSymptomItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.symptomsList}
              showsVerticalScrollIndicator={false}
            />

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.continueButton,
                selectedSymptoms.length === 0 && styles.continueButtonDisabled
              ]}
              onPress={handleStartAnalysis}
              disabled={selectedSymptoms.length === 0}
            >
              <Text style={styles.continueButtonText}>
                {t('continue_assessment')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 'questions' && !isAnalyzing && renderQuestion()}

        {isAnalyzing && (
          <View style={styles.analyzingContainer}>
            <Ionicons name="medical" size={64} color="#6366F1" />
            <Text style={styles.analyzingTitle}>{t('analyzing_symptoms')}</Text>
            <Text style={styles.analyzingSubtitle}>
              {t('ai_processing')}
            </Text>
          </View>
        )}

        {currentStep === 'results' && renderResults()}
      </SafeAreaView>
    </>
  );
}

// Styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 15,
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  symptomsContainer: {
    flex: 1
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1A1A1A'
  },
  selectedCount: {
    backgroundColor: '#6366F1',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  selectedCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  symptomsList: {
    paddingHorizontal: 20
  },
  symptomCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  symptomCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#f8f9ff'
  },
  symptomIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  symptomName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8
  },
  symptomNameSelected: {
    color: '#6366F1'
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  severityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600'
  },
  continueButton: {
    backgroundColor: '#6366F1',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc'
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  questionContainer: {
    flex: 1,
    padding: 20
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 32,
    textAlign: 'center'
  },
  booleanOptions: {
    flexDirection: 'row',
    gap: 12
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  optionButtonSecondary: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#6366F1'
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  optionTextSecondary: {
    color: '#6366F1'
  },
  multipleOptions: {
    gap: 12
  },
  multipleOptionButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  multipleOptionText: {
    color: '#1A1A1A',
    fontSize: 16,
    textAlign: 'center'
  },
  scaleContainer: {
    alignItems: 'center'
  },
  scaleNumbers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16
  },
  scaleNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scaleNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A'
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  scaleLabel: {
    fontSize: 14,
    color: '#666'
  },
  analyzingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  analyzingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 8
  },
  analyzingSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  resultsContainer: {
    flex: 1
  },
  resultsHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  diagnosisCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
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
  diagnosisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  diagnosisCondition: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1
  },
  probabilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  probabilityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  diagnosisDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1
  },
  disclaimerCard: {
    backgroundColor: '#fff5f0',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  disclaimerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20
  },
  consultButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  consultButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});
