import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { PrimaryButton } from '../components/common';
import { styles, colors } from '../styles';

// Basit karşılama ekranı: Kullanıcıyı temel menüye yönlendirir
const AnaSayfaScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgGradientEnd }]}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <Text style={[styles.heroTitle, { textAlign: 'center', marginBottom: 12 }]}>Hoş Geldin!</Text>
        <Text style={[styles.muted, { textAlign: 'center', marginBottom: 32 }]}>Diyetisyen Uygulamasına hoş geldiniz.</Text>
        <PrimaryButton
          label="Öğün Gir"
          onPress={() => navigation.navigate('BasicMainMenu')}
        />
      </View>
    </SafeAreaView>
  );
};

export default AnaSayfaScreen;