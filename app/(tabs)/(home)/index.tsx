
import React, { useState, useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { 
  ScrollView, 
  Pressable, 
  StyleSheet, 
  View, 
  Text, 
  TextInput,
  Platform,
  Alert
} from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LevelData {
  name: string;
  rate: number;
  amount: number;
}

export default function HomeScreen() {
  const router = useRouter();
  
  // State variables
  const [assessmentSum, setAssessmentSum] = useState<string>('12500');
  const [division, setDivision] = useState<'Leben' | 'Sach' | 'KV'>('Leben');
  const [isZufuhrerActive, setIsZufuhrerActive] = useState<boolean>(false);
  const [revenueLevel, setRevenueLevel] = useState<number>(6); // Default: Ebene 6
  
  // Entry rates per division (in promille or percent)
  const [entryRates, setEntryRates] = useState({
    Leben: 100,
    Sach: 80,
    KV: 130,
  });
  
  // Overhead rates (only when Zuführer is active)
  const [overheadRates, setOverheadRates] = useState({
    Leben: 7,
    Sach: 4,
    KV: 12,
  });
  
  // Level commission rates (in %)
  const [levelRates, setLevelRates] = useState([
    { name: 'Strukturführer (S0)', rate: 15 },
    { name: 'Leiter (S1)', rate: 12 },
    { name: 'Ebene 2', rate: 10 },
    { name: 'Ebene 3', rate: 8 },
    { name: 'Ebene 4', rate: 7 },
    { name: 'Ebene 5', rate: 6 },
    { name: 'Ebene 6', rate: 5 },
    { name: 'Ebene 7', rate: 4 },
    { name: 'Ebene 8', rate: 3 },
    { name: 'Ebene 9', rate: 2 },
  ]);
  
  const [visibleLevels, setVisibleLevels] = useState<number>(7);
  
  // Load saved data
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const savedEntryRates = await AsyncStorage.getItem('entryRates');
      const savedOverheadRates = await AsyncStorage.getItem('overheadRates');
      const savedLevelRates = await AsyncStorage.getItem('levelRates');
      const savedVisibleLevels = await AsyncStorage.getItem('visibleLevels');
      
      if (savedEntryRates) setEntryRates(JSON.parse(savedEntryRates));
      if (savedOverheadRates) setOverheadRates(JSON.parse(savedOverheadRates));
      if (savedLevelRates) setLevelRates(JSON.parse(savedLevelRates));
      if (savedVisibleLevels) setVisibleLevels(JSON.parse(savedVisibleLevels));
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };
  
  // Calculate commission distribution
  const calculateDistribution = (): LevelData[] => {
    const sum = parseFloat(assessmentSum) || 0;
    const entryRate = entryRates[division];
    
    // Calculate base commission pot
    const commissionPot = (sum * entryRate) / 100;
    
    // Calculate distribution from revenue level upwards
    const results: LevelData[] = [];
    let remainingPot = commissionPot;
    
    for (let i = revenueLevel; i >= 0; i--) {
      const level = levelRates[i];
      const levelAmount = (commissionPot * level.rate) / 100;
      remainingPot -= levelAmount;
      
      results.unshift({
        name: level.name,
        rate: level.rate,
        amount: levelAmount,
      });
    }
    
    // Add overhead if Zuführer is active
    if (isZufuhrerActive) {
      const overheadAmount = (sum * overheadRates[division]) / 100;
      results.unshift({
        name: 'Zuführer (Overhead)',
        rate: overheadRates[division],
        amount: overheadAmount,
      });
    }
    
    return results;
  };
  
  const distribution = calculateDistribution();
  const totalAmount = distribution.reduce((sum, item) => sum + item.amount, 0);
  
  const exportToCSV = () => {
    let csv = 'Ebene,Provisionssatz (%),Betrag (€)\n';
    distribution.forEach(item => {
      csv += `${item.name},${item.rate},${item.amount.toFixed(2)}\n`;
    });
    csv += `\nGesamt,,${totalAmount.toFixed(2)}\n`;
    csv += `Bewertungssumme,,${assessmentSum}\n`;
    csv += `Sparte,,${division}\n`;
    
    // In a real app, you would use a library like react-native-fs or expo-sharing
    Alert.alert(
      'CSV Export',
      'CSV-Daten wurden generiert. In einer vollständigen App würde dies als Datei gespeichert.',
      [{ text: 'OK' }]
    );
    console.log('CSV Data:', csv);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Provisionsrechner",
          headerRight: () => (
            <Pressable
              onPress={exportToCSV}
              style={styles.headerButton}
            >
              <IconSymbol name="square.and.arrow.up" color={colors.primary} size={22} />
            </Pressable>
          ),
        }}
      />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Input Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bewertungssumme</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={assessmentSum}
              onChangeText={setAssessmentSum}
              keyboardType="numeric"
              placeholder="12500"
              placeholderTextColor={colors.textLight}
            />
            <Text style={styles.inputSuffix}>€</Text>
          </View>
        </View>
        
        {/* Division Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sparte</Text>
          <View style={styles.radioGroup}>
            {(['Leben', 'Sach', 'KV'] as const).map((div) => (
              <Pressable
                key={div}
                style={[
                  styles.radioButton,
                  division === div && styles.radioButtonActive
                ]}
                onPress={() => setDivision(div)}
              >
                <View style={[
                  styles.radioCircle,
                  division === div && styles.radioCircleActive
                ]}>
                  {division === div && <View style={styles.radioInner} />}
                </View>
                <Text style={[
                  styles.radioLabel,
                  division === div && styles.radioLabelActive
                ]}>
                  {div}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.actionButton,
              isZufuhrerActive && styles.actionButtonActive
            ]}
            onPress={() => setIsZufuhrerActive(!isZufuhrerActive)}
          >
            <IconSymbol 
              name={isZufuhrerActive ? "checkmark.circle.fill" : "circle"} 
              color={isZufuhrerActive ? colors.primary : colors.textLight} 
              size={20} 
            />
            <Text style={[
              styles.actionButtonText,
              isZufuhrerActive && styles.actionButtonTextActive
            ]}>
              Zuführer aktivieren
            </Text>
          </Pressable>
          
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/edit-levels')}
          >
            <IconSymbol name="slider.horizontal.3" color={colors.text} size={20} />
            <Text style={styles.actionButtonText}>Ebenen bearbeiten</Text>
          </Pressable>
        </View>
        
        {/* Overhead Settings (only visible when Zuführer is active) */}
        {isZufuhrerActive && (
          <View style={[styles.card, styles.overheadCard]}>
            <Text style={styles.sectionTitle}>Overhead-Sätze</Text>
            <View style={styles.overheadRow}>
              <Text style={styles.overheadLabel}>Leben:</Text>
              <View style={styles.smallInputContainer}>
                <TextInput
                  style={styles.smallInput}
                  value={overheadRates.Leben.toString()}
                  onChangeText={(text) => {
                    const value = parseFloat(text) || 0;
                    setOverheadRates({ ...overheadRates, Leben: value });
                  }}
                  keyboardType="numeric"
                />
                <Text style={styles.inputSuffix}>%</Text>
              </View>
            </View>
            <View style={styles.overheadRow}>
              <Text style={styles.overheadLabel}>Sach:</Text>
              <View style={styles.smallInputContainer}>
                <TextInput
                  style={styles.smallInput}
                  value={overheadRates.Sach.toString()}
                  onChangeText={(text) => {
                    const value = parseFloat(text) || 0;
                    setOverheadRates({ ...overheadRates, Sach: value });
                  }}
                  keyboardType="numeric"
                />
                <Text style={styles.inputSuffix}>%</Text>
              </View>
            </View>
            <View style={styles.overheadRow}>
              <Text style={styles.overheadLabel}>KV:</Text>
              <View style={styles.smallInputContainer}>
                <TextInput
                  style={styles.smallInput}
                  value={overheadRates.KV.toString()}
                  onChangeText={(text) => {
                    const value = parseFloat(text) || 0;
                    setOverheadRates({ ...overheadRates, KV: value });
                  }}
                  keyboardType="numeric"
                />
                <Text style={styles.inputSuffix}>%</Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Results Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Provisionsverteilung</Text>
          {distribution.map((item, index) => {
            const isRevenueLevel = item.name === levelRates[revenueLevel]?.name;
            const isStructureLeader = item.name === 'Strukturführer (S0)';
            
            return (
              <View
                key={index}
                style={[
                  styles.resultRow,
                  isStructureLeader && styles.structureLeaderRow,
                  isRevenueLevel && styles.revenueLevelRow,
                ]}
              >
                <View style={styles.resultLeft}>
                  <Text style={[
                    styles.resultName,
                    isStructureLeader && styles.structureLeaderText
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={styles.resultRate}>{item.rate}%</Text>
                </View>
                <Text style={[
                  styles.resultAmount,
                  isStructureLeader && styles.structureLeaderAmount
                ]}>
                  {item.amount.toFixed(2)} €
                </Text>
              </View>
            );
          })}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Gesamt</Text>
            <Text style={styles.totalAmount}>{totalAmount.toFixed(2)} €</Text>
          </View>
        </View>
        
        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: `0px 2px 12px ${colors.shadow}`,
    elevation: 3,
  },
  overheadCard: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 16,
  },
  inputSuffix: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textLight,
    marginLeft: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioButtonActive: {
    backgroundColor: '#FFF9E6',
    borderColor: colors.primary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textLight,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  radioLabelActive: {
    color: colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  actionButtonActive: {
    backgroundColor: '#FFF9E6',
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  actionButtonTextActive: {
    color: colors.primary,
  },
  overheadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  overheadLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  smallInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
  },
  smallInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 8,
    textAlign: 'right',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: colors.backgroundAlt,
  },
  structureLeaderRow: {
    backgroundColor: '#FFF9E6',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  revenueLevelRow: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  resultLeft: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  structureLeaderText: {
    color: colors.primary,
    fontWeight: '700',
  },
  resultRate: {
    fontSize: 13,
    color: colors.textLight,
  },
  resultAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  structureLeaderAmount: {
    color: colors.primary,
    fontSize: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  headerButton: {
    padding: 8,
  },
});
