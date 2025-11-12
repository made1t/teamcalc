
import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { 
  ScrollView, 
  StyleSheet, 
  View, 
  Text, 
  TextInput,
  Alert
} from "react-native";
import { colors } from "@/styles/commonStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconSymbol } from "@/components/IconSymbol";

export default function SettingsScreen() {
  // Eingangssatz (100% in ‰) - The total commission pool per division
  const [hundredPercentRates, setHundredPercentRates] = useState({
    Leben: '44',
    Sach: '22.5',
    KV: '8',
  });
  
  // Zuführer overhead rates (added on top of 100%)
  const [overheadRates, setOverheadRates] = useState({
    Leben: '0',
    Sach: '0',
    KV: '0.3',
  });
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      const savedHundredPercent = await AsyncStorage.getItem('hundredPercentRates');
      const savedOverhead = await AsyncStorage.getItem('overheadRates');
      
      if (savedHundredPercent) {
        const parsed = JSON.parse(savedHundredPercent);
        setHundredPercentRates({
          Leben: parsed.Leben.toString(),
          Sach: parsed.Sach.toString(),
          KV: parsed.KV.toString(),
        });
      }
      
      if (savedOverhead) {
        const parsed = JSON.parse(savedOverhead);
        setOverheadRates({
          Leben: parsed.Leben.toString(),
          Sach: parsed.Sach.toString(),
          KV: parsed.KV.toString(),
        });
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };
  
  const saveSettings = async () => {
    try {
      const hundredPercentData = {
        Leben: parseFloat(hundredPercentRates.Leben) || 44,
        Sach: parseFloat(hundredPercentRates.Sach) || 22.5,
        KV: parseFloat(hundredPercentRates.KV) || 8,
      };
      
      const overheadData = {
        Leben: parseFloat(overheadRates.Leben) || 0,
        Sach: parseFloat(overheadRates.Sach) || 0,
        KV: parseFloat(overheadRates.KV) || 0.3,
      };
      
      await AsyncStorage.setItem('hundredPercentRates', JSON.stringify(hundredPercentData));
      await AsyncStorage.setItem('overheadRates', JSON.stringify(overheadData));
      
      Alert.alert('Gespeichert', 'Einstellungen wurden gespeichert.');
    } catch (error) {
      console.log('Error saving settings:', error);
      Alert.alert('Fehler', 'Einstellungen konnten nicht gespeichert werden.');
    }
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: "Einstellungen",
        }}
      />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol name="slider.horizontal.3" color={colors.primary} size={24} />
            <Text style={styles.title}>Eingangssätze (100%)</Text>
          </View>
          <Text style={styles.description}>
            Diese Werte definieren den Eingangssatz (100% Provision), der sich durch die Struktur verteilt. Verschiedene Vertriebe können unterschiedliche Eingangssätze haben.
          </Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Leben</Text>
              <Text style={styles.labelHint}>Bewertungssumme</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={hundredPercentRates.Leben}
                onChangeText={(text) => setHundredPercentRates({ ...hundredPercentRates, Leben: text })}
                onBlur={saveSettings}
                keyboardType="numeric"
                placeholder="44"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputSuffix}>‰</Text>
            </View>
            <Text style={styles.hint}>
              Beispiel: 44‰ bedeutet 4,4% der Bewertungssumme
            </Text>
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Sach</Text>
              <Text style={styles.labelHint}>Jahresnettoprämie</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={hundredPercentRates.Sach}
                onChangeText={(text) => setHundredPercentRates({ ...hundredPercentRates, Sach: text })}
                onBlur={saveSettings}
                keyboardType="numeric"
                placeholder="22.5"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputSuffix}>%</Text>
            </View>
            <Text style={styles.hint}>
              Beispiel: 22,5% der Jahresnettoprämie
            </Text>
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>KV</Text>
              <Text style={styles.labelHint}>Monatsbeitrag</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={hundredPercentRates.KV}
                onChangeText={(text) => setHundredPercentRates({ ...hundredPercentRates, KV: text })}
                onBlur={saveSettings}
                keyboardType="numeric"
                placeholder="8"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputSuffix}>‰</Text>
            </View>
            <View style={styles.kvSpecialBox}>
              <IconSymbol name="info.circle.fill" color={colors.primary} size={16} />
              <Text style={styles.kvSpecialText}>
                Bei KV wird der Monatsbeitrag mit Faktor 8 multipliziert
              </Text>
            </View>
            <Text style={styles.hint}>
              Beispiel: 8‰ bedeutet 0,8% vom (Monatsbeitrag × 8)
            </Text>
          </View>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol name="person.badge.plus" color="#2E7D32" size={24} />
            <Text style={styles.title}>Zuführer-Overhead</Text>
          </View>
          <Text style={styles.description}>
            Diese Werte werden zusätzlich zu den 100% berechnet und dem Zuführer zugewiesen. Der Overhead ist individuell für jede Sparte einstellbar.
          </Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Leben Overhead</Text>
              <View style={styles.overheadBadge}>
                <Text style={styles.overheadBadgeText}>on top</Text>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={overheadRates.Leben}
                onChangeText={(text) => setOverheadRates({ ...overheadRates, Leben: text })}
                onBlur={saveSettings}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputSuffix}>‰</Text>
            </View>
            <Text style={styles.hint}>
              Zusätzlich zur Bewertungssumme
            </Text>
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Sach Overhead</Text>
              <View style={styles.overheadBadge}>
                <Text style={styles.overheadBadgeText}>on top</Text>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={overheadRates.Sach}
                onChangeText={(text) => setOverheadRates({ ...overheadRates, Sach: text })}
                onBlur={saveSettings}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputSuffix}>‰</Text>
            </View>
            <Text style={styles.hint}>
              Zusätzlich zur Jahresnettoprämie
            </Text>
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>KV Overhead</Text>
              <View style={styles.overheadBadge}>
                <Text style={styles.overheadBadgeText}>on top</Text>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={overheadRates.KV}
                onChangeText={(text) => setOverheadRates({ ...overheadRates, KV: text })}
                onBlur={saveSettings}
                keyboardType="numeric"
                placeholder="0.3"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputSuffix}>‰</Text>
            </View>
            <View style={styles.kvSpecialBox}>
              <IconSymbol name="info.circle.fill" color={colors.primary} size={16} />
              <Text style={styles.kvSpecialText}>
                Overhead wird ebenfalls mit Faktor 8 multipliziert
              </Text>
            </View>
            <Text style={styles.hint}>
              Beispiel: 0,3‰ zusätzlich zu den 8‰ = insgesamt 8,3‰ (jeweils × 8)
            </Text>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Wichtige Hinweise</Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoBullet}>• </Text>
            <Text style={styles.infoLabel}>Eingangssätze:</Text> Definieren den Provisionstopf (100%), der sich durch die Struktur verteilt.{'\n'}
            
            <Text style={styles.infoBullet}>• </Text>
            <Text style={styles.infoLabel}>Differenz-Prinzip:</Text> Jede Ebene erhält nur die Differenz zwischen ihrem Satz und dem Satz der darunterliegenden Ebene.{'\n'}
            
            <Text style={styles.infoBullet}>• </Text>
            <Text style={styles.infoLabel}>Zuführer-Overhead:</Text> Wird zusätzlich berechnet und ist nicht Teil der 100%.{'\n'}
            
            <Text style={styles.infoBullet}>• </Text>
            <Text style={styles.infoLabel}>KV-Besonderheit:</Text> Bei KV wird sowohl der Eingangssatz als auch der Overhead mit dem Monatsbeitrag × 8 berechnet.{'\n'}
            
            <Text style={styles.infoBullet}>• </Text>
            <Text style={styles.infoLabel}>Verschiedene Vertriebe:</Text> Sie können die Eingangssätze individuell anpassen, da verschiedene Vertriebe unterschiedliche Sätze haben können.
          </Text>
        </View>
        
        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>📊 Berechnungsbeispiel KV</Text>
          <View style={styles.exampleContent}>
            <Text style={styles.exampleText}>
              Monatsbeitrag: 500 €{'\n'}
              Eingangssatz: 8‰{'\n'}
              Zuführer-Overhead: 0,3‰
            </Text>
            <View style={styles.exampleDivider} />
            <Text style={styles.exampleCalculation}>
              Provisionstopf (100%):{'\n'}
              500 € × 8 × 8‰ = 32 €{'\n\n'}
              Zuführer-Overhead:{'\n'}
              500 € × 8 × 0,3‰ = 1,20 €
            </Text>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  labelHint: {
    fontSize: 13,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  overheadBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#81C784',
  },
  overheadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 14,
  },
  inputSuffix: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
    marginLeft: 8,
  },
  hint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  kvSpecialBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    gap: 8,
  },
  kvSpecialText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#90CAF9',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 24,
  },
  infoBullet: {
    fontWeight: '700',
    color: colors.primary,
  },
  infoLabel: {
    fontWeight: '700',
    color: colors.text,
  },
  exampleCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  exampleContent: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
  },
  exampleText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    fontWeight: '600',
  },
  exampleDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  exampleCalculation: {
    fontSize: 14,
    color: colors.primary,
    lineHeight: 22,
    fontWeight: '600',
  },
});
