
import React, { useState, useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { 
  ScrollView, 
  Pressable,
  StyleSheet, 
  View, 
  Text, 
  TextInput,
  Alert
} from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

interface Level {
  name: string;
  rate: number;
}

export default function EditLevelsScreen() {
  const router = useRouter();
  
  const [levels, setLevels] = useState<Level[]>([
    { name: 'Strukturführer (S0)', rate: 100 },
    { name: 'Leiter (S1)', rate: 100 },
    { name: 'Ebene 2', rate: 95 },
    { name: 'Ebene 3', rate: 85 },
    { name: 'Ebene 4', rate: 75 },
    { name: 'Ebene 5', rate: 65 },
    { name: 'Ebene 6', rate: 55 },
    { name: 'Ebene 7', rate: 50 },
    { name: 'Ebene 8', rate: 45 },
    { name: 'Ebene 9', rate: 40 },
  ]);
  
  const [visibleLevels, setVisibleLevels] = useState<number>(7);
  const [revenueLevelIndex, setRevenueLevelIndex] = useState<number>(6);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  
  useEffect(() => {
    loadLevels();
  }, []);
  
  const loadLevels = async () => {
    try {
      const savedLevels = await AsyncStorage.getItem('levelRates');
      const savedVisible = await AsyncStorage.getItem('visibleLevels');
      const savedRevenueLevel = await AsyncStorage.getItem('revenueLevel');
      
      if (savedLevels) {
        const parsed = JSON.parse(savedLevels);
        setLevels(parsed);
        console.log('Loaded levels:', parsed);
      }
      if (savedVisible) {
        const parsed = JSON.parse(savedVisible);
        setVisibleLevels(parsed);
        console.log('Loaded visibleLevels:', parsed);
      }
      if (savedRevenueLevel) {
        const parsed = JSON.parse(savedRevenueLevel);
        setRevenueLevelIndex(parsed);
        console.log('Loaded revenueLevelIndex:', parsed);
      }
    } catch (error) {
      console.log('Error loading levels:', error);
    }
  };
  
  const saveLevels = async () => {
    try {
      // Validate that percentages decrease going down
      let isValid = true;
      let errorMessage = '';
      
      for (let i = 0; i < levels.length - 1; i++) {
        if (levels[i].rate < levels[i + 1].rate) {
          isValid = false;
          errorMessage = `Fehler: ${levels[i].name} (${levels[i].rate}%) hat weniger als ${levels[i + 1].name} (${levels[i + 1].rate}%). Übergeordnete Ebenen müssen höhere Prozentsätze haben.`;
          break;
        }
      }
      
      if (!isValid) {
        Alert.alert('Ungültige Prozentsätze', errorMessage);
        return false;
      }
      
      // Calculate total percentage
      let totalPercentage = 0;
      for (let i = revenueLevelIndex; i >= 0; i--) {
        if (i === revenueLevelIndex) {
          totalPercentage += levels[i].rate;
        } else {
          const nextLevelRate = levels[i + 1].rate;
          totalPercentage += (levels[i].rate - nextLevelRate);
        }
      }
      
      if (Math.abs(totalPercentage - 100) > 0.1) {
        return new Promise<boolean>((resolve) => {
          Alert.alert(
            'Warnung',
            `Die Gesamtprozentsätze ergeben ${totalPercentage.toFixed(1)}% statt 100%. Bitte passen Sie die Werte an.`,
            [
              { 
                text: 'Trotzdem speichern', 
                onPress: async () => {
                  await AsyncStorage.setItem('levelRates', JSON.stringify(levels));
                  await AsyncStorage.setItem('visibleLevels', JSON.stringify(visibleLevels));
                  await AsyncStorage.setItem('revenueLevel', JSON.stringify(revenueLevelIndex));
                  console.log('Saved levels:', levels);
                  console.log('Saved visibleLevels:', visibleLevels);
                  console.log('Saved revenueLevelIndex:', revenueLevelIndex);
                  setHasUnsavedChanges(false);
                  Alert.alert('Gespeichert', 'Ebenen wurden gespeichert.');
                  resolve(true);
                }
              },
              { 
                text: 'Abbrechen', 
                style: 'cancel',
                onPress: () => resolve(false)
              }
            ]
          );
        });
      }
      
      await AsyncStorage.setItem('levelRates', JSON.stringify(levels));
      await AsyncStorage.setItem('visibleLevels', JSON.stringify(visibleLevels));
      await AsyncStorage.setItem('revenueLevel', JSON.stringify(revenueLevelIndex));
      console.log('Saved levels:', levels);
      console.log('Saved visibleLevels:', visibleLevels);
      console.log('Saved revenueLevelIndex:', revenueLevelIndex);
      setHasUnsavedChanges(false);
      Alert.alert('Gespeichert', 'Ebenen wurden gespeichert.');
      return true;
    } catch (error) {
      console.log('Error saving levels:', error);
      Alert.alert('Fehler', 'Ebenen konnten nicht gespeichert werden.');
      return false;
    }
  };
  
  const handleSaveAndGoBack = async () => {
    const saved = await saveLevels();
    if (saved !== false) {
      router.back();
    }
  };
  
  const updateLevelRate = (index: number, value: number) => {
    const newLevels = [...levels];
    newLevels[index].rate = value;
    
    // Enforce hierarchical logic: upper levels must have >= rate than lower levels
    // If changing a level, ensure all levels above have at least this rate
    for (let i = index - 1; i >= 0; i--) {
      if (newLevels[i].rate < value) {
        newLevels[i].rate = value;
      }
    }
    
    // Ensure all levels below have at most this rate
    for (let i = index + 1; i < newLevels.length; i++) {
      if (newLevels[i].rate > value) {
        newLevels[i].rate = value;
      }
    }
    
    setLevels(newLevels);
    setHasUnsavedChanges(true);
  };
  
  const expandLevels = () => {
    if (visibleLevels < 10) {
      setVisibleLevels(10);
      setHasUnsavedChanges(true);
    }
  };
  
  const collapseLevels = () => {
    if (visibleLevels > 7) {
      setVisibleLevels(7);
      setHasUnsavedChanges(true);
    }
  };
  
  const handleRevenueLevelChange = (index: number) => {
    setRevenueLevelIndex(index);
    setHasUnsavedChanges(true);
  };
  
  // Calculate the difference for each level
  const calculateDifference = (index: number): number => {
    if (index === revenueLevelIndex) {
      // Revenue level gets their full rate
      return levels[index].rate;
    } else if (index < revenueLevelIndex) {
      // Levels above revenue level get the difference
      const nextLevelRate = index + 1 <= revenueLevelIndex ? levels[index + 1].rate : 0;
      return levels[index].rate - nextLevelRate;
    }
    return 0;
  };
  
  // Calculate total percentage
  const calculateTotalPercentage = (): number => {
    let total = 0;
    for (let i = revenueLevelIndex; i >= 0; i--) {
      total += calculateDifference(i);
    }
    return total;
  };
  
  const totalPercentage = calculateTotalPercentage();
  
  return (
    <>
      <Stack.Screen
        options={{
          title: "Ebenen bearbeiten",
          headerLeft: () => (
            <Pressable
              onPress={() => {
                if (hasUnsavedChanges) {
                  Alert.alert(
                    'Ungespeicherte Änderungen',
                    'Möchten Sie die Änderungen speichern?',
                    [
                      { text: 'Verwerfen', style: 'destructive', onPress: () => router.back() },
                      { text: 'Speichern', onPress: handleSaveAndGoBack },
                      { text: 'Abbrechen', style: 'cancel' }
                    ]
                  );
                } else {
                  router.back();
                }
              }}
              style={styles.headerButton}
            >
              <IconSymbol name="chevron.left" color={colors.primary} size={24} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={saveLevels}
              style={styles.headerButton}
            >
              <IconSymbol name="checkmark" color={colors.primary} size={24} />
              {hasUnsavedChanges && <View style={styles.unsavedIndicator} />}
            </Pressable>
          ),
        }}
      />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Provisionsverteilung</Text>
          <Text style={styles.description}>
            Legen Sie die Provisionssätze für jede Ebene fest. Übergeordnete Ebenen müssen höhere Prozentsätze haben. Bei Gesamt muss immer 100% stehen.
          </Text>
          
          {/* Total Percentage Display */}
          <View style={[
            styles.totalPercentageCard,
            Math.abs(totalPercentage - 100) < 0.1 ? styles.totalPercentageCardValid : styles.totalPercentageCardInvalid
          ]}>
            <Text style={styles.totalPercentageLabel}>Gesamt:</Text>
            <Text style={[
              styles.totalPercentageValue,
              Math.abs(totalPercentage - 100) < 0.1 ? styles.totalPercentageValueValid : styles.totalPercentageValueInvalid
            ]}>
              {totalPercentage.toFixed(1)}%
            </Text>
            {Math.abs(totalPercentage - 100) < 0.1 ? (
              <IconSymbol name="checkmark.circle.fill" color="#2E7D32" size={24} />
            ) : (
              <IconSymbol name="exclamationmark.triangle.fill" color="#D32F2F" size={24} />
            )}
          </View>
          
          {levels.slice(0, visibleLevels).map((level, index) => {
            const isStructureLeader = index === 0;
            const isRevenueLevel = index === revenueLevelIndex;
            const difference = calculateDifference(index);
            const isActive = index <= revenueLevelIndex;
            
            return (
              <View
                key={index}
                style={[
                  styles.levelRow,
                  isStructureLeader && styles.structureLeaderRow,
                  isRevenueLevel && styles.revenueLevelRow,
                  !isActive && styles.inactiveLevelRow,
                ]}
              >
                <View style={styles.levelHeader}>
                  <View style={styles.levelInfo}>
                    <Text style={[
                      styles.levelName,
                      isStructureLeader && styles.structureLeaderText,
                      !isActive && styles.inactiveText,
                    ]}>
                      {level.name}
                    </Text>
                    {isStructureLeader && (
                      <View style={styles.badge}>
                        <IconSymbol name="crown.fill" color={colors.primary} size={14} />
                      </View>
                    )}
                  </View>
                  <Pressable
                    style={[
                      styles.revenueLevelButton,
                      isRevenueLevel && styles.revenueLevelButtonActive
                    ]}
                    onPress={() => handleRevenueLevelChange(index)}
                  >
                    <Text style={[
                      styles.revenueLevelButtonText,
                      isRevenueLevel && styles.revenueLevelButtonTextActive
                    ]}>
                      {isRevenueLevel ? '✓ Umsatzgeber' : 'Als Umsatzgeber'}
                    </Text>
                  </Pressable>
                </View>
                
                <View style={styles.rateControl}>
                  <View style={styles.rateRow}>
                    <View style={styles.rateInputContainer}>
                      <TextInput
                        style={styles.rateInput}
                        value={level.rate.toString()}
                        onChangeText={(text) => {
                          const value = parseFloat(text) || 0;
                          updateLevelRate(index, value);
                        }}
                        keyboardType="numeric"
                      />
                      <Text style={styles.rateInputSuffix}>%</Text>
                    </View>
                    
                    {isActive && (
                      <View style={styles.differenceContainer}>
                        <Text style={styles.differenceLabel}>Erhält:</Text>
                        <Text style={styles.differenceValue}>{difference.toFixed(1)}%</Text>
                      </View>
                    )}
                  </View>
                  
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    step={0.5}
                    value={level.rate}
                    onValueChange={(value) => updateLevelRate(index, value)}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                </View>
                
                {!isActive && (
                  <View style={styles.inactiveNotice}>
                    <Text style={styles.inactiveNoticeText}>
                      Nicht aktiv (unterhalb des Umsatzgebers)
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
          
          {visibleLevels < 10 && (
            <Pressable style={styles.expandButton} onPress={expandLevels}>
              <IconSymbol name="plus.circle.fill" color={colors.primary} size={20} />
              <Text style={styles.expandButtonText}>
                Weitere Ebenen anzeigen (bis zu 10)
              </Text>
            </Pressable>
          )}
          
          {visibleLevels > 7 && (
            <Pressable style={styles.collapseButton} onPress={collapseLevels}>
              <IconSymbol name="minus.circle.fill" color={colors.textLight} size={20} />
              <Text style={styles.collapseButtonText}>
                Weniger Ebenen anzeigen
              </Text>
            </Pressable>
          )}
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Wichtige Hinweise</Text>
          <Text style={styles.infoText}>
            • Der Strukturführer (S0) steht immer ganz oben.{'\n'}
            • Die Umsatzgebende Ebene wird farblich markiert.{'\n'}
            • Jede Ebene erhält nur die Differenz zu der darunterliegenden Ebene.{'\n'}
            • Übergeordnete Ebenen müssen höhere oder gleiche Prozentsätze haben.{'\n'}
            • Bei Gesamt muss immer 100% stehen.{'\n'}
            • Der Leiter hat in der Regel 100%, dann Ebene 2 95%, Ebene 3 85% usw.
          </Text>
        </View>
        
        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>📊 Beispiel-Berechnung</Text>
          <Text style={styles.exampleText}>
            Leiter (S1, Umsatzgeber): 100% → erhält 100%{'\n'}
            Strukturführer (S0): 100% → erhält 0% (Differenz){'\n'}
            {'\n'}
            Oder:{'\n'}
            Ebene 3 (Umsatzgeber): 85% → erhält 85%{'\n'}
            Ebene 2: 95% → erhält 10% (Differenz){'\n'}
            Leiter: 100% → erhält 5% (Differenz){'\n'}
            Strukturführer: 100% → erhält 0% (Differenz){'\n'}
            {'\n'}
            Gesamt: 85% + 10% + 5% + 0% = 100%
          </Text>
        </View>
        
        {/* Save Button at Bottom */}
        <Pressable 
          style={[styles.saveButton, hasUnsavedChanges && styles.saveButtonActive]}
          onPress={handleSaveAndGoBack}
        >
          <IconSymbol name="checkmark.circle.fill" color="#FFFFFF" size={24} />
          <Text style={styles.saveButtonText}>
            {hasUnsavedChanges ? 'Änderungen speichern' : 'Gespeichert'}
          </Text>
        </Pressable>
        
        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  totalPercentageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
  },
  totalPercentageCardValid: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  totalPercentageCardInvalid: {
    backgroundColor: '#FFEBEE',
    borderColor: '#D32F2F',
  },
  totalPercentageLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  totalPercentageValue: {
    fontSize: 28,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  totalPercentageValueValid: {
    color: '#2E7D32',
  },
  totalPercentageValueInvalid: {
    color: '#D32F2F',
  },
  levelRow: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
  inactiveLevelRow: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  structureLeaderText: {
    color: colors.primary,
    fontWeight: '700',
  },
  inactiveText: {
    color: colors.textLight,
  },
  badge: {
    marginLeft: 8,
  },
  revenueLevelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  revenueLevelButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  revenueLevelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
  },
  revenueLevelButtonTextActive: {
    color: colors.text,
  },
  rateControl: {
    gap: 8,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rateInput: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: 8,
    minWidth: 50,
    textAlign: 'right',
  },
  rateInputSuffix: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginLeft: 4,
  },
  differenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  differenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginRight: 4,
  },
  differenceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  inactiveNotice: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 6,
  },
  inactiveNoticeText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: colors.backgroundAlt,
  },
  collapseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#81C784',
    marginBottom: 16,
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
  exampleCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFB74D',
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.textLight,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 4,
  },
  saveButtonActive: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  headerButton: {
    padding: 8,
    position: 'relative',
  },
  unsavedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5722',
  },
});
