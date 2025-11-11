
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
  const [revenueLevelIndex, setRevenueLevelIndex] = useState<number>(6);
  
  useEffect(() => {
    loadLevels();
  }, []);
  
  const loadLevels = async () => {
    try {
      const savedLevels = await AsyncStorage.getItem('levelRates');
      const savedVisible = await AsyncStorage.getItem('visibleLevels');
      const savedRevenueLevel = await AsyncStorage.getItem('revenueLevel');
      
      if (savedLevels) setLevels(JSON.parse(savedLevels));
      if (savedVisible) setVisibleLevels(JSON.parse(savedVisible));
      if (savedRevenueLevel) setRevenueLevelIndex(JSON.parse(savedRevenueLevel));
    } catch (error) {
      console.log('Error loading levels:', error);
    }
  };
  
  const saveLevels = async () => {
    try {
      await AsyncStorage.setItem('levelRates', JSON.stringify(levels));
      await AsyncStorage.setItem('visibleLevels', JSON.stringify(visibleLevels));
      await AsyncStorage.setItem('revenueLevel', JSON.stringify(revenueLevelIndex));
      Alert.alert('Gespeichert', 'Ebenen wurden gespeichert.');
    } catch (error) {
      console.log('Error saving levels:', error);
      Alert.alert('Fehler', 'Ebenen konnten nicht gespeichert werden.');
    }
  };
  
  const updateLevelRate = (index: number, value: number) => {
    const newLevels = [...levels];
    newLevels[index].rate = value;
    setLevels(newLevels);
  };
  
  const expandLevels = () => {
    if (visibleLevels < 10) {
      setVisibleLevels(10);
      saveLevels();
    }
  };
  
  const collapseLevels = () => {
    if (visibleLevels > 7) {
      setVisibleLevels(7);
      saveLevels();
    }
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: "Ebenen bearbeiten",
          headerLeft: () => (
            <Pressable
              onPress={() => {
                saveLevels();
                router.back();
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
            Legen Sie die Provisionssätze für jede Ebene fest. Der Strukturführer steht immer ganz oben.
          </Text>
          
          {levels.slice(0, visibleLevels).map((level, index) => {
            const isStructureLeader = index === 0;
            const isRevenueLevel = index === revenueLevelIndex;
            
            return (
              <View
                key={index}
                style={[
                  styles.levelRow,
                  isStructureLeader && styles.structureLeaderRow,
                  isRevenueLevel && styles.revenueLevelRow,
                ]}
              >
                <View style={styles.levelHeader}>
                  <View style={styles.levelInfo}>
                    <Text style={[
                      styles.levelName,
                      isStructureLeader && styles.structureLeaderText
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
                    onPress={() => {
                      setRevenueLevelIndex(index);
                      saveLevels();
                    }}
                  >
                    <Text style={[
                      styles.revenueLevelButtonText,
                      isRevenueLevel && styles.revenueLevelButtonTextActive
                    ]}>
                      {isRevenueLevel ? 'Umsatzgeber' : 'Als Umsatzgeber'}
                    </Text>
                  </Pressable>
                </View>
                
                <View style={styles.rateControl}>
                  <View style={styles.rateInputContainer}>
                    <TextInput
                      style={styles.rateInput}
                      value={level.rate.toString()}
                      onChangeText={(text) => {
                        const value = parseFloat(text) || 0;
                        updateLevelRate(index, value);
                      }}
                      onBlur={saveLevels}
                      keyboardType="numeric"
                    />
                    <Text style={styles.rateInputSuffix}>%</Text>
                  </View>
                  
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={30}
                    step={0.5}
                    value={level.rate}
                    onValueChange={(value) => updateLevelRate(index, value)}
                    onSlidingComplete={saveLevels}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                </View>
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
          <Text style={styles.infoTitle}>💡 Hinweis</Text>
          <Text style={styles.infoText}>
            - Der Strukturführer (S0) steht immer ganz oben und ist nicht verschiebbar.{'\n'}
            - Die Umsatzgebende Ebene wird farblich markiert.{'\n'}
            - Verwenden Sie den Slider oder geben Sie den Wert direkt ein.
          </Text>
        </View>
        
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
    marginBottom: 24,
    lineHeight: 20,
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
  rateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
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
  slider: {
    width: '100%',
    height: 40,
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
