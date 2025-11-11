
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
  const [entryRates, setEntryRates] = useState({
    Leben: '100',
    Sach: '80',
    KV: '130',
  });
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('entryRates');
      if (saved) {
        const parsed = JSON.parse(saved);
        setEntryRates({
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
      const data = {
        Leben: parseFloat(entryRates.Leben) || 100,
        Sach: parseFloat(entryRates.Sach) || 80,
        KV: parseFloat(entryRates.KV) || 130,
      };
      await AsyncStorage.setItem('entryRates', JSON.stringify(data));
      Alert.alert('Gespeichert', 'Eingangssätze wurden gespeichert.');
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
          <Text style={styles.title}>Eingangssätze pro Sparte</Text>
          <Text style={styles.description}>
            Diese Sätze dienen als 100%-Basis für die Provisionsverteilung.
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Leben-Eingangssatz</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={entryRates.Leben}
                onChangeText={(text) => setEntryRates({ ...entryRates, Leben: text })}
                onBlur={saveSettings}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputSuffix}>‰</Text>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sach-Eingangssatz</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={entryRates.Sach}
                onChangeText={(text) => setEntryRates({ ...entryRates, Sach: text })}
                onBlur={saveSettings}
                keyboardType="numeric"
                placeholder="80"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputSuffix}>‰</Text>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>KV-Eingangssatz</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={entryRates.KV}
                onChangeText={(text) => setEntryRates({ ...entryRates, KV: text })}
                onBlur={saveSettings}
                keyboardType="numeric"
                placeholder="130"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.inputSuffix}>‰</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Hinweis</Text>
          <Text style={styles.infoText}>
            Die Eingangssätze werden in Promille (‰) oder Prozent angegeben. 
            Beispiel: 100 ‰ = 10%
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
    lineHeight: 20,
  },
});
