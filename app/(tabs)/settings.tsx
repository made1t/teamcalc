
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

export default function SettingsScreen() {
  // 100% in ‰ - The total commission pool per division
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
          <Text style={styles.title}>100% in Promille (‰)</Text>
          <Text style={styles.description}>
            Diese Werte definieren, wie viel Promille von der Bewertungssumme die 100% Provision ausmachen, die sich durch die Struktur verteilt.
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Leben (100% = x‰)</Text>
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
            <Text style={styles.label}>Sach (100% = x% vom Sachnettobeitrag)</Text>
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
              Beispiel: 22,5% vom Sachnettobeitrag
            </Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>KV (100% = x‰ vom Monatsbeitrag)</Text>
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
            <Text style={styles.hint}>
              Beispiel: 8‰ bedeutet 0,8% vom Monatsbeitrag
            </Text>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.title}>Zuführer-Overhead (on top)</Text>
          <Text style={styles.description}>
            Diese Werte werden zusätzlich zu den 100% berechnet und dem Zuführer zugewiesen.
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Leben Overhead</Text>
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
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sach Overhead</Text>
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
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>KV Overhead</Text>
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
            <Text style={styles.hint}>
              Beispiel: 0,3‰ zusätzlich zu den 8‰ = insgesamt 8,3‰
            </Text>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Wichtige Hinweise</Text>
          <Text style={styles.infoText}>
            • Die "100% in ‰" Werte definieren den Provisionstopf, der sich durch die Struktur verteilt.{'\n'}
            • Jede Ebene erhält nur die Differenz zwischen ihrem Satz und dem Satz der darunterliegenden Ebene.{'\n'}
            • Der Zuführer-Overhead wird zusätzlich berechnet und ist nicht Teil der 100%.{'\n'}
            • Beispiel KV: 100% = 8‰, Zuführer bekommt zusätzlich 0,3‰ on top.
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
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
});
