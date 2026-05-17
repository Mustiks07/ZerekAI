import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Қате', 'Email мен құпия сөзді толтырыңыз');
      return;
    }
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Қате', 'Кіру сәтсіз аяқталды. Деректеріңізді тексеріңіз.');
    }
  };

  const handleDemoMode = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoSection}>
            <Text style={styles.logo}>🧠</Text>
            <Text style={styles.appName}>ZerekAI</Text>
            <Text style={styles.tagline}>ҰБТ-ға дайындалудың ең оңай жолы</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor={Colors.ink3}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Құпия сөз</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.ink3}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Button title="Кіру" onPress={handleLogin} loading={isLoading} />

            <Button
              title="Демо режім →"
              variant="secondary"
              onPress={handleDemoMode}
            />

            <Button
              title="Тіркелу"
              variant="ghost"
              onPress={() => router.push('/(auth)/register')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 64 },
  appName: { fontSize: 32, fontWeight: '800', color: Colors.primary, marginTop: 8 },
  tagline: { fontSize: 14, color: Colors.ink3, marginTop: 4, textAlign: 'center' },
  form: { gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.ink2, marginLeft: 4 },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.line,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.ink,
  },
});
