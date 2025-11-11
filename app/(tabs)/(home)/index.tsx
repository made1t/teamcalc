
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
  difference: number;
  amount: number;
}

export default function HomeScreen() {
  const router = useRouter();
  
  // State variables
  const [assessmentSum, setAssessmentSum] = useState<string>('12500');
  const [division, setDivision] = useState<'Leben' | 'Sach' | 'KV'>('Leben');
  const [isZufuhrerActive, setIsZufuhrerActive] = useState<boolean>(false);
  const [revenueLevel, setRevenueLevel] = useState<number>(6); // Default: Ebene 6
  
  // 100% in ‰ - The total commission pool per division
  const [hundredPercentRates, setHundredPercentRates] = useState({
    Leben: 44,
    Sach: 22.5,
    KV: 8,
  });
  
  // Overhead rates (only when Zuführer is active)
  const [overheadRates, setOverheadRates] = useState({
    Leben: 0,
    Sach: 0,
    KV: 0.3,
  });
  
  // Level commission rates (in %)
  const [levelRates, setLevelRates] = useState([
    { name: 'Strukturführer (S0)', rate: 85 },
    { name: 'Leiter (S1)', rate: 80 },
    { name: 'Ebene 2', rate: 75 },
    { name: 'Ebene 3', rate: 70 },
    { name: 'Ebene 4', rate: 65 },
    { name: 'Ebene 5', rate: 60 },
    { name: 'Ebene 6', rate: 55 },
    { name: 'Ebene 7', rate: 50 },
    { name: 'Ebene 8', rate: 45 },
    { name: 'Ebene 9', rate: 40 },
  ]);
  
  const [visibleLevels, setVisibleLevels] = useState<number>(7);
  
  // Load saved data
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const savedHundredPercent = await AsyncStorage.getItem('hundredPercentRates');
      const savedOverheadRates = await AsyncStorage.getItem('overheadRates');
      const savedLevelRates = await AsyncStorage.getItem('levelRates');
      const savedVisibleLevels = await AsyncStorage.getItem('visibleLevels');
      const savedRevenueLevel = await AsyncStorage.getItem('revenueLevel');
      
      if (savedHundredPercent) setHundredPercentRates(JSON.parse(savedHundredPercent));
      if (savedOverheadRates) setOverheadRates(JSON.parse(savedOverheadRates));
      if (savedLevelRates) setLevelRates(JSON.parse(savedLevelRates));
      if (savedVisibleLevels) setVisibleLevels(JSON.parse(savedVisibleLevels));
      if (savedRevenueLevel) setRevenueLevel(JSON.parse(savedRevenueLevel));
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };
  
  // Calculate commission distribution with difference-based logic
  const calculateDistribution = (): LevelData[] => {
    const sum = parseFloat(assessmentSum) || 0;
    const hundredPercentRate = hundredPercentRates[division];
    
    // Calculate base commission pot (100% in ‰)
    // For Sach, it's already in %, for Leben and KV it's in ‰
    const commissionPot = division === 'Sach' 
      ? (sum * hundredPercentRate) / 100 
      : (sum * hundredPercentRate) / 1000;
    
    console.log(`Assessment Sum: ${sum}, Division: ${division}, 100% Rate: ${hundredPercentRate}‰, Commission Pot: ${commissionPot}`);
    
    // Calculate distribution from revenue level upwards using difference logic
    const results: LevelData[] = [];
    
    for (let i = revenueLevel; i >= 0; i--) {
      const level = levelRates[i];
      let difference = 0;
      
      if (i === revenueLevel) {
        // Revenue level gets their full rate
        difference = level.rate;
      } else {
        // Upper levels get only the difference
        const nextLevelRate = levelRates[i + 1].rate;
        difference = level.rate - nextLevelRate;
      }
      
      // Calculate the actual amount in currency
      const levelAmount = (commissionPot * difference) / 100;
      
      console.log(`Level ${i} (${level.name}): Rate ${level.rate}%, Difference ${difference}%, Amount ${levelAmount}`);
      
      results.unshift({
        name: level.name,
        rate: level.rate,
        difference: difference,
        amount: levelAmount,
      });
    }
    
    // Add overhead if Zuführer is active
    if (isZufuhrerActive) {
      const overheadRate = overheadRates[division];
      const overheadAmount = division === 'Sach'
        ? (sum * overheadRate) / 100
        : (sum * overheadRate) / 1000;
      
      console.log(`Zuführer Overhead: ${overheadRate}‰, Amount: ${overheadAmount}`);
      
      results.unshift({
        name: 'Zuführer (Overhead)',
        rate: overheadRate,
        difference: overheadRate,
        amount: overheadAmount,
      });
    }
    
    return results;
  };
  
  const distribution = calculateDistribution();
  const totalAmount = distribution.reduce((sum, item) => sum + item.amount, 0);
  const totalPercentage = distribution.reduce((sum, item) => sum + item.difference, 0);
  
  const exportToCSV = () => {
    let csv = 'Ebene,Provisionssatz (%),Differenz (%),Betrag (€)\n';
    distribution.forEach(item => {
      csv += `${item.name},${item.rate},${item.difference.toFixed(2)},${item.amount.toFixed(2)}\n`;
    });
    csv += `\nGesamt,,${totalPercentage.toFixed(2)},${totalAmount.toFixed(2)}\n`;
    csv += `Bewertungssumme,,,${assessmentSum}\n`;
    csv += `Sparte,,,${division}\n`;
    csv += `100% in ‰,,,${hundredPercentRates[division]}\n`;
    
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
          <View style={styles.divisionInfo}>
            <Text style={styles.divisionInfoText}>
              100% = {hundredPercentRates[division]}{division === 'Sach' ? '%' : '‰'}
              {division === 'KV' && ' (Monatsbeitrag)'}
              {division === 'Sach' && ' (Sachnettobeitrag)'}
            </Text>
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
        
        {/* Overhead Info (only visible when Zuführer is active) */}
        {isZufuhrerActive && (
          <View style={[styles.card, styles.overheadCard]}>
            <View style={styles.overheadHeader}>
              <IconSymbol name="info.circle.fill" color={colors.primary} size={20} />
              <Text style={styles.overheadTitle}>Zuführer-Overhead aktiv</Text>
            </View>
            <Text style={styles.overheadText}>
              Zusätzlich zu den 100%: +{overheadRates[division]}{division === 'Sach' ? '%' : '‰'}
            </Text>
          </View>
        )}
        
        {/* Results Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Provisionsverteilung</Text>
          <Text style={styles.sectionSubtitle}>
            Verteilung nach Differenz-Prinzip
          </Text>
          
          {distribution.map((item, index) => {
            const isRevenueLevel = item.name === levelRates[revenueLevel]?.name;
            const isStructureLeader = item.name === 'Strukturführer (S0)';
            const isZufuhrer = item.name === 'Zuführer (Overhead)';
            
            return (
              <View
                key={index}
                style={[
                  styles.resultRow,
                  isStructureLeader && styles.structureLeaderRow,
                  isRevenueLevel && styles.revenueLevelRow,
                  isZufuhrer && styles.zufuhrerRow,
                ]}
              >
                <View style={styles.resultLeft}>
                  <Text style={[
                    styles.resultName,
                    isStructureLeader && styles.structureLeaderText,
                    isZufuhrer && styles.zufuhrerText,
                  ]}>
                    {item.name}
                  </Text>
                  <View style={styles.resultDetails}>
                    <Text style={styles.resultRate}>
                      Satz: {item.rate}%
                    </Text>
                    <Text style={styles.resultDifference}>
                      Erhält: {item.difference.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                <Text style={[
                  styles.resultAmount,
                  isStructureLeader && styles.structureLeaderAmount,
                  isZufuhrer && styles.zufuhrerAmount,
                ]}>
                  {item.amount.toFixed(2)} €
                </Text>
              </View>
            );
          })}
          
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Gesamt</Text>
              <Text style={styles.totalPercentage}>{totalPercentage.toFixed(1)}%</Text>
            </View>
            <Text style={styles.totalAmount}>{totalAmount.toFixed(2)} €</Text>
          </View>
        </View>
        
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Berechnungslogik</Text>
          <Text style={styles.infoText}>
            • Die Bewertungssumme wird mit {hundredPercentRates[division]}{division === 'Sach' ? '%' : '‰'} multipliziert = Provisionstopf{'\n'}
            • Jede Ebene erhält nur die Differenz zu der darunterliegenden Ebene{'\n'}
            • Der Umsatzgeber erhält seinen vollen Satz{'\n'}
            • Übergeordnete Ebenen erhalten nur die Differenz{'\n'}
            • Der Zuführer-Overhead wird zusätzlich berechnet (on top)
          </Text>
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
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
    fontStyle: 'italic',
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
  divisionInfo: {
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
  },
  divisionInfoText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
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
  overheadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  overheadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  overheadText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
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
  zufuhrerRow: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#81C784',
  },
  resultLeft: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  structureLeaderText: {
    color: colors.primary,
    fontWeight: '700',
  },
  zufuhrerText: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  resultDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  resultRate: {
    fontSize: 12,
    color: colors.textLight,
  },
  resultDifference: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
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
  zufuhrerAmount: {
    color: '#2E7D32',
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
  totalPercentage: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  headerButton: {
    padding: 8,
  },
});
