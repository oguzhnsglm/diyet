import React, { useContext } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable } from 'react-native';
import { DietContext } from '../context/DietContext';

const AuthPageScreen = ({ navigation }) => {
  const { user } = useContext(DietContext);

  const hasUser = !!user;

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>Diyetisyen Uygulaması</Text>
        {hasUser ? (
          <Text style={styles.subtitle}>Hoş geldin, {user.name}. Devam etmek için aşağıya tıkla.</Text>
        ) : (
          <Text style={styles.subtitle}>Devam etmek için giriş yapın veya kaydolun.</Text>
        )}

        {hasUser ? (
          <Pressable style={[styles.button, styles.continue]} onPress={() => navigation.replace('MainMenu')}>
            <Text style={styles.buttonLabel}>Devam Et</Text>
          </Pressable>
        ) : (
          <>
            <Pressable style={[styles.button, styles.login]} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.buttonLabel}>Giriş Yap</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.register]} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.buttonLabel}>Kaydol</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f6f9',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 320,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#4A4A4A',
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  login: {
    backgroundColor: '#4CAF50',
  },
  register: {
    backgroundColor: '#3498DB',
    marginBottom: 0,
  },
  continue: {
    backgroundColor: '#2E7D32',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AuthPageScreen;