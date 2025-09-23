// app/(tabs)/medicine.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    FlatList,
    ListRenderItem,
    Modal,
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
// Types
interface Medicine {
    id: string;
    name: string;
    genericName: string;
    brand: string;
    strength: string;
    form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drops';
    price: number;
    availability: 'in_stock' | 'low_stock' | 'out_of_stock';
    stockCount: number;
    descriptionKey: string; // Changed from description to descriptionKey
    manufacturer: string;
    requiresPrescription: boolean;
    category: string;
}


interface Pharmacy {
    id: string;
    name: string;
    address: string;
    distance: string;
    rating: number;
    isOpen: boolean;
    phone: string;
}

interface OrderItem {
    medicine: Medicine;
    quantity: number;
    pharmacy: Pharmacy;
}

interface Category {
    id: string;
    nameKey: string; // Translation key
    icon: keyof typeof Ionicons.glyphMap;
}

// Mock medicines data
// Mock medicines data with translatable descriptions
const MEDICINES_DATA: Medicine[] = [
    {
        id: '1',
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        brand: 'Crocin',
        strength: '500mg',
        form: 'tablet',
        price: 25,
        availability: 'in_stock',
        stockCount: 150,
        descriptionKey: 'desc_paracetamol', // Changed from description to descriptionKey
        manufacturer: 'GSK',
        requiresPrescription: false,
        category: 'pain_relief'
    },
    {
        id: '2',
        name: 'Amoxicillin',
        genericName: 'Amoxicillin',
        brand: 'Novamox',
        strength: '250mg',
        form: 'capsule',
        price: 85,
        availability: 'in_stock',
        stockCount: 75,
        descriptionKey: 'desc_amoxicillin', // Changed to descriptionKey
        manufacturer: 'Cipla',
        requiresPrescription: true,
        category: 'antibiotic'
    },
    {
        id: '3',
        name: 'Cetirizine',
        genericName: 'Cetirizine HCl',
        brand: 'Zyrtec',
        strength: '10mg',
        form: 'tablet',
        price: 45,
        availability: 'low_stock',
        stockCount: 12,
        descriptionKey: 'desc_cetirizine', // Changed to descriptionKey
        manufacturer: 'UCB',
        requiresPrescription: false,
        category: 'allergy'
    },
    {
        id: '4',
        name: 'Insulin',
        genericName: 'Human Insulin',
        brand: 'Humulin',
        strength: '100IU/ml',
        form: 'injection',
        price: 450,
        availability: 'in_stock',
        stockCount: 25,
        descriptionKey: 'desc_insulin', // Changed to descriptionKey
        manufacturer: 'Eli Lilly',
        requiresPrescription: true,
        category: 'diabetes'
    },
    {
        id: '5',
        name: 'Cough Syrup',
        genericName: 'Dextromethorphan',
        brand: 'Benadryl',
        strength: '100ml',
        form: 'syrup',
        price: 65,
        availability: 'out_of_stock',
        stockCount: 0,
        descriptionKey: 'desc_cough_syrup', // Changed to descriptionKey
        manufacturer: 'J&J',
        requiresPrescription: false,
        category: 'respiratory'
    },
    {
        id: '6',
        name: 'Ibuprofen',
        genericName: 'Ibuprofen',
        brand: 'Brufen',
        strength: '400mg',
        form: 'tablet',
        price: 35,
        availability: 'in_stock',
        stockCount: 200,
        descriptionKey: 'desc_ibuprofen', // Changed to descriptionKey
        manufacturer: 'Abbott',
        requiresPrescription: false,
        category: 'pain_relief'
    }
];


const PHARMACIES_DATA: Pharmacy[] = [
    {
        id: '1',
        name: 'City Medical Store',
        address: '123 Main Street, Sector 15',
        distance: '0.5 km',
        rating: 4.5,
        isOpen: true,
        phone: '+91 98765 43210'
    },
    {
        id: '2',
        name: 'Health Plus Pharmacy',
        address: '456 Park Road, Near Hospital',
        distance: '1.2 km',
        rating: 4.3,
        isOpen: true,
        phone: '+91 87654 32109'
    },
    {
        id: '3',
        name: '24/7 Medicine Corner',
        address: '789 Market Square, Central Plaza',
        distance: '2.1 km',
        rating: 4.7,
        isOpen: false,
        phone: '+91 76543 21098'
    }
];

// Categories with translation keys
const CATEGORIES: Category[] = [
    { id: 'all', nameKey: 'category_all', icon: 'medical' },
    { id: 'pain_relief', nameKey: 'category_pain_relief', icon: 'bandage' },
    { id: 'antibiotic', nameKey: 'category_antibiotic', icon: 'shield' },
    { id: 'allergy', nameKey: 'category_allergy', icon: 'flower' },
    { id: 'diabetes', nameKey: 'category_diabetes', icon: 'pulse' },
    { id: 'respiratory', nameKey: 'category_respiratory', icon: 'fitness' }
];

export default function MedicineAvailability() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [showMedicineModal, setShowMedicineModal] = useState(false);
    const [showPharmacyModal, setShowPharmacyModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderQuantity, setOrderQuantity] = useState(1);
    const [cartItems, setCartItems] = useState<OrderItem[]>([]);

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

    const filteredMedicines = MEDICINES_DATA.filter(medicine => {
        const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            medicine.brand.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getAvailabilityColor = (availability: string) => {
        switch (availability) {
            case 'in_stock': return '#4CAF50';
            case 'low_stock': return '#FF9800';
            case 'out_of_stock': return '#f44336';
            default: return '#666';
        }
    };

    const getAvailabilityText = (availability: string) => {
        switch (availability) {
            case 'in_stock': return t('in_stock');
            case 'low_stock': return t('low_stock');
            case 'out_of_stock': return t('out_of_stock');
            default: return '';
        }
    };

    const getFormIcon = (form: string) => {
        switch (form) {
            case 'tablet': return 'medical';
            case 'capsule': return 'ellipse';
            case 'syrup': return 'flask';
            case 'injection': return 'medical-outline';
            case 'cream': return 'water';
            case 'drops': return 'water-outline';
            default: return 'medical';
        }
    };

    const getFormText = (form: string) => {
        return t(`form_${form}`);
    };

    const handleMedicinePress = useCallback((medicine: Medicine) => {
        setSelectedMedicine(medicine);
        setShowMedicineModal(true);
    }, []);

    const handleOrderPress = useCallback(() => {
        if (!selectedMedicine) return;

        if (selectedMedicine.requiresPrescription) {
            Alert.alert(
                t('prescription_required'),
                t('prescription_required_msg'),
                [
                    { text: t('cancel'), style: 'cancel' },
                    {
                        text: t('upload_prescription'), onPress: () => {
                            setShowMedicineModal(false);
                            // Navigate to prescription upload
                        }
                    }
                ]
            );
            return;
        }

        setShowMedicineModal(false);
        setShowPharmacyModal(true);
    }, [selectedMedicine, t]);

    const handlePharmacySelect = useCallback((pharmacy: Pharmacy) => {
        setSelectedPharmacy(pharmacy);
        setShowPharmacyModal(false);
        setShowOrderModal(true);
    }, []);

    const handlePlaceOrder = useCallback(() => {
        if (!selectedMedicine || !selectedPharmacy) return;

        const orderItem: OrderItem = {
            medicine: selectedMedicine,
            quantity: orderQuantity,
            pharmacy: selectedPharmacy
        };

        setCartItems(prev => [...prev, orderItem]);
        setShowOrderModal(false);

        Alert.alert(
            t('order_placed'),
            t('order_placed_msg', {
                pharmacy: selectedPharmacy.name,
                medicine: selectedMedicine.name,
                quantity: orderQuantity.toString()
            }),
            [
                {
                    text: t('view_orders'), onPress: () => {
                        // Navigate to orders screen
                    }
                },
                { text: t('continue_shopping'), style: 'cancel' }
            ]
        );

        // Reset selections
        setSelectedMedicine(null);
        setSelectedPharmacy(null);
        setOrderQuantity(1);
    }, [selectedMedicine, selectedPharmacy, orderQuantity, t]);

    const renderCategoryItem: ListRenderItem<Category> = useCallback(({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                selectedCategory === item.id && styles.categoryItemActive
            ]}
            onPress={() => setSelectedCategory(item.id)}
        >
            <View style={[
                styles.categoryIcon,
                selectedCategory === item.id && styles.categoryIconActive
            ]}>
                <Ionicons
                    name={item.icon}
                    size={20}
                    color={selectedCategory === item.id ? '#fff' : '#6366F1'}
                />
            </View>
            <Text style={[
                styles.categoryText,
                selectedCategory === item.id && styles.categoryTextActive
            ]}>
                {t(item.nameKey)}
            </Text>
        </TouchableOpacity>
    ), [selectedCategory, t]);

    const renderMedicineItem: ListRenderItem<Medicine> = useCallback(({ item }) => (
        <TouchableOpacity
            style={styles.medicineCard}
            onPress={() => handleMedicinePress(item)}
        >
            <View style={styles.medicineHeader}>
                <View style={styles.medicineIconContainer}>
                    <Ionicons
                        name={getFormIcon(item.form) as keyof typeof Ionicons.glyphMap}
                        size={24}
                        color="#6366F1"
                    />
                </View>

                <View style={styles.medicineInfo}>
                    <Text style={styles.medicineName}>{item.name}</Text>
                    <Text style={styles.medicineBrand}>{item.brand} - {item.strength}</Text>
                    <Text style={styles.medicineGeneric}>{item.genericName}</Text>
                </View>

                <View style={styles.priceContainer}>
                    <Text style={styles.priceText}>₹{item.price}</Text>
                    <Text style={styles.priceLabel}>{t('per')} {getFormText(item.form)}</Text>
                </View>
            </View>

            <View style={styles.medicineDetails}>
                <View style={styles.availabilityContainer}>
                    <View style={[
                        styles.availabilityDot,
                        { backgroundColor: getAvailabilityColor(item.availability) }
                    ]} />
                    <Text style={[
                        styles.availabilityText,
                        { color: getAvailabilityColor(item.availability) }
                    ]}>
                        {getAvailabilityText(item.availability)}
                    </Text>
                    {item.availability !== 'out_of_stock' && (
                        <Text style={styles.stockText}>({item.stockCount} {t('left')})</Text>
                    )}
                </View>

                {item.requiresPrescription && (
                    <View style={styles.prescriptionBadge}>
                        <Ionicons name="document-text" size={12} color="#FF9800" />
                        <Text style={styles.prescriptionText}>{t('prescription_required')}</Text>
                    </View>
                )}
            </View>

            <Text style={styles.medicineDescription} numberOfLines={2}>
                {t(item.descriptionKey)} {/* Changed from item.description to t(item.descriptionKey) */}
            </Text>
        </TouchableOpacity>
    ), [handleMedicinePress, t]);

    const renderPharmacyItem: ListRenderItem<Pharmacy> = useCallback(({ item }) => (
        <TouchableOpacity
            style={styles.pharmacyCard}
            onPress={() => handlePharmacySelect(item)}
        >
            <View style={styles.pharmacyHeader}>
                <View style={styles.pharmacyIconContainer}>
                    <Ionicons name="storefront" size={24} color="#4CAF50" />
                </View>

                <View style={styles.pharmacyInfo}>
                    <Text style={styles.pharmacyName}>{item.name}</Text>
                    <Text style={styles.pharmacyAddress}>{item.address}</Text>
                    <Text style={styles.pharmacyDistance}>{item.distance} {t('away')}</Text>
                </View>

                <View style={styles.pharmacyStatus}>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.isOpen ? '#4CAF50' : '#f44336' }
                    ]}>
                        <Text style={styles.statusText}>
                            {item.isOpen ? t('open') : t('closed')}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.pharmacyActions}>
                <TouchableOpacity style={styles.callButton}>
                    <Ionicons name="call" size={16} color="#6366F1" />
                    <Text style={styles.callButtonText}>{t('call')}</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    ), [handlePharmacySelect, t]);

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('medicine_availability')}</Text>
                    <TouchableOpacity style={styles.cartButton}>
                        <Ionicons name="bag" size={24} color="#666" />
                        {cartItems.length > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('search_medicines')}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity style={styles.filterButton}>
                        <Ionicons name="options-outline" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Categories */}
                <View style={styles.categoriesSection}>
                    <FlatList
                        data={CATEGORIES}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesList}
                    />
                </View>

                {/* Medicines List */}
                <FlatList
                    data={filteredMedicines}
                    renderItem={renderMedicineItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.medicinesList}
                    showsVerticalScrollIndicator={false}
                />

                {/* Medicine Detail Modal */}
                <Modal
                    visible={showMedicineModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowMedicineModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            {selectedMedicine && (
                                <>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>{selectedMedicine.name}</Text>
                                        <TouchableOpacity
                                            style={styles.modalCloseButton}
                                            onPress={() => setShowMedicineModal(false)}
                                        >
                                            <Ionicons name="close" size={24} color="#666" />
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView style={styles.modalContent}>
                                        <View style={styles.medicineDetailCard}>
                                            <Text style={styles.detailTitle}>{t('medicine_details')}</Text>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>{t('generic_name')}:</Text>
                                                <Text style={styles.detailValue}>{selectedMedicine.genericName}</Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>{t('brand')}:</Text>
                                                <Text style={styles.detailValue}>{selectedMedicine.brand}</Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>{t('strength')}:</Text>
                                                <Text style={styles.detailValue}>{selectedMedicine.strength}</Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>{t('manufacturer')}:</Text>
                                                <Text style={styles.detailValue}>{selectedMedicine.manufacturer}</Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>{t('price')}:</Text>
                                                <Text style={styles.detailValue}>₹{selectedMedicine.price}</Text>
                                            </View>
                                        </View>

                                        <Text style={styles.descriptionText}>{t(selectedMedicine.descriptionKey)}</Text>
                                    </ScrollView>

                                    <TouchableOpacity
                                        style={[
                                            styles.orderButton,
                                            selectedMedicine.availability === 'out_of_stock' && styles.orderButtonDisabled
                                        ]}
                                        onPress={handleOrderPress}
                                        disabled={selectedMedicine.availability === 'out_of_stock'}
                                    >
                                        <Text style={styles.orderButtonText}>
                                            {selectedMedicine.availability === 'out_of_stock'
                                                ? t('out_of_stock')
                                                : t('order_now')}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>

                {/* Pharmacy Selection Modal */}
                <Modal
                    visible={showPharmacyModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowPharmacyModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{t('select_pharmacy')}</Text>
                                <TouchableOpacity
                                    style={styles.modalCloseButton}
                                    onPress={() => setShowPharmacyModal(false)}
                                >
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={PHARMACIES_DATA}
                                renderItem={renderPharmacyItem}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.pharmaciesList}
                            />
                        </View>
                    </View>
                </Modal>

                {/* Order Confirmation Modal */}
                <Modal
                    visible={showOrderModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowOrderModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            {selectedMedicine && selectedPharmacy && (
                                <>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>{t('confirm_order')}</Text>
                                        <TouchableOpacity
                                            style={styles.modalCloseButton}
                                            onPress={() => setShowOrderModal(false)}
                                        >
                                            <Ionicons name="close" size={24} color="#666" />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.orderSummary}>
                                        <Text style={styles.summaryTitle}>{t('order_summary')}</Text>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>{t('medicine')}:</Text>
                                            <Text style={styles.summaryValue}>{selectedMedicine.name}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>{t('pharmacy')}:</Text>
                                            <Text style={styles.summaryValue}>{selectedPharmacy.name}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>{t('price')}:</Text>
                                            <Text style={styles.summaryValue}>₹{selectedMedicine.price}</Text>
                                        </View>

                                        <View style={styles.quantityContainer}>
                                            <Text style={styles.summaryLabel}>{t('quantity')}:</Text>
                                            <View style={styles.quantityControls}>
                                                <TouchableOpacity
                                                    style={styles.quantityButton}
                                                    onPress={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                                                >
                                                    <Ionicons name="remove" size={16} color="#6366F1" />
                                                </TouchableOpacity>
                                                <Text style={styles.quantityText}>{orderQuantity}</Text>
                                                <TouchableOpacity
                                                    style={styles.quantityButton}
                                                    onPress={() => setOrderQuantity(orderQuantity + 1)}
                                                >
                                                    <Ionicons name="add" size={16} color="#6366F1" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <View style={[styles.summaryRow, styles.totalRow]}>
                                            <Text style={styles.totalLabel}>{t('total')}:</Text>
                                            <Text style={styles.totalValue}>₹{selectedMedicine.price * orderQuantity}</Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.confirmButton}
                                        onPress={handlePlaceOrder}
                                    >
                                        <Text style={styles.confirmButtonText}>{t('place_order')}</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </>
    );
}

// Styles remain exactly the same...
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
    cartButton: {
        padding: 8,
        position: 'relative'
    },
    cartBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#f44336',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cartBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600'
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
    filterButton: {
        padding: 8
    },
    categoriesSection: {
        backgroundColor: 'white',
        paddingBottom: 16
    },
    categoriesList: {
        paddingHorizontal: 20
    },
    categoryItem: {
        alignItems: 'center',
        marginRight: 16,
        paddingVertical: 8
    },
    categoryItemActive: {
        // Active state handled by icon and text colors
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f8f9ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8
    },
    categoryIconActive: {
        backgroundColor: '#6366F1'
    },
    categoryText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500'
    },
    categoryTextActive: {
        color: '#6366F1',
        fontWeight: '600'
    },
    medicinesList: {
        paddingHorizontal: 20,
        paddingBottom: 20
    },
    medicineCard: {
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
    medicineHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    medicineIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f8f9ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    medicineInfo: {
        flex: 1,
        marginRight: 8
    },
    medicineName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4
    },
    medicineBrand: {
        fontSize: 14,
        color: '#6366F1',
        marginBottom: 2
    },
    medicineGeneric: {
        fontSize: 12,
        color: '#666'
    },
    priceContainer: {
        alignItems: 'flex-end'
    },
    priceText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A'
    },
    priceLabel: {
        fontSize: 10,
        color: '#666'
    },
    medicineDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    availabilityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    availabilityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6
    },
    availabilityText: {
        fontSize: 12,
        fontWeight: '500',
        marginRight: 4
    },
    stockText: {
        fontSize: 10,
        color: '#666'
    },
    prescriptionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff5f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
    },
    prescriptionText: {
        fontSize: 10,
        color: '#FF9800',
        marginLeft: 4,
        fontWeight: '500'
    },
    medicineDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16
    },
    pharmacyCard: {
        backgroundColor: '#f8f9ff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12
    },
    pharmacyHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    pharmacyIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    pharmacyInfo: {
        flex: 1,
        marginRight: 8
    },
    pharmacyName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4
    },
    pharmacyAddress: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2
    },
    pharmacyDistance: {
        fontSize: 12,
        color: '#6366F1',
        fontWeight: '500'
    },
    pharmacyStatus: {
        alignItems: 'flex-end'
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A1A1A',
        marginLeft: 4
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600'
    },
    pharmacyActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },
    callButtonText: {
        fontSize: 12,
        color: '#6366F1',
        marginLeft: 4,
        fontWeight: '500'
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
        maxHeight: '80%',
        minHeight: '50%'
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A'
    },
    modalCloseButton: {
        padding: 8
    },
    modalContent: {
        flex: 1,
        padding: 20
    },
    medicineDetailCard: {
        backgroundColor: '#f8f9ff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
    },
    detailTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 12
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1
    },
    detailValue: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right'
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20
    },
    orderButton: {
        backgroundColor: '#4CAF50',
        margin: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    orderButtonDisabled: {
        backgroundColor: '#ccc'
    },
    orderButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    pharmaciesList: {
        padding: 20
    },
    orderSummary: {
        padding: 20
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 16
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666'
    },
    summaryValue: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500'
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f8f9ff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#6366F1'
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginHorizontal: 16
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
        marginTop: 8
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A'
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4CAF50'
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        margin: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    }
});
