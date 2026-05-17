import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('11');
  const { signUp, isLoading } = useAuth();

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Қате', 'Барлық міндетті өрістерді толтырыңыз');
      return;
    }
    try {
      await signUp(email, password, { full_name: fullName, city, school, grade: parseInt(grade, 10) });
      router.replace('/(auth)/onboarding');
    } catch (error: any) {
      console.error('Sign up error:', error);
      const message = error?.message ?? 'Тіркелу сәтсіз аяқталды.';
      Alert.alert('Қате', message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Тіркелу 📝</Text>
          <Text style={styles.subtitle}>ZerekAI-ға қош келдіңіз!</Text>

          <View style={styles.form}>
            {[
              { label: 'Аты-жөні *', value: fullName, setter: setFullName, placeholder: 'Айдос Серікұлы' },
              { label: 'Email *', value: email, setter: setEmail, placeholder: 'email@example.com', keyboard: 'email-address' as const },
              { label: 'Құпия сөз *', value: password, setter: setPassword, placeholder: '••••••••', secure: true },
              { label: 'Қала', value: city, setter: setCity, placeholder: 'Алматы' },
              { label: 'Мектеп', value: school, setter: setSchool, placeholder: '№42 мектеп-гимназия' },
            ].map((field) => (
              <View key={field.label} style={styles.inputGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor={Colors.ink3}
                  value={field.value}
                  onChangeText={field.setter}
                  secureTextEntry={field.secure}
                  keyboardType={field.keyboard ?? 'default'}
                  autoCapitalize={field.keyboard === 'email-address' ? 'none' : 'words'}
                />
              </View>
            ))}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Сынып</Text>
              <View style={styles.gradeRow}>
                {['9', '10', '11'].map((g) => (
                  <Button
                    key={g}
                    title={`${g} сынып`}
                    variant={grade === g ? 'primary' : 'ghost'}
                    fullWidth={false}
                    onPress={() => setGrade(g)}
                    style={styles.gradeBtn}
                  />
                ))}
              </View>
            </View>

            <Button title="Тіркелу" onPress={handleRegister} loading={isLoading} />
            <Button title="← Кіру бетіне" variant="ghost" onPress={() => router.back()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.ink },
  subtitle: { fontSize: 15, color: Colors.ink3, marginTop: 4, marginBottom: 24 },
  form: { gap: 14 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.ink2, marginLeft: 4 },
  input: {
    backgroundColor: Colors.card, borderWidth: 2, borderColor: Colors.line,
    borderRadius: 12, padding: 14, fontSize: 16, color: Colors.ink,
  },
  gradeRow: { flexDirection: 'row', gap: 8 },
  gradeBtn: { flex: 1, paddingVertical: 10 },
});
