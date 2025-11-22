import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { PrimaryButton } from '../components/common';
import { styles, colors } from '../styles';

// Kullanıcının paylaştığı basit MainMenu yapısına yakın minimal ekran
const BasicMainMenuScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgGradientStart }]}>
      <View style={{ flex: 1, padding: 24 }}>
        <Text style={[styles.heroTitle, { marginBottom: 16 }]}>Diyetisyen Uygulaması</Text>
        <Text style={[styles.muted, { marginBottom: 32 }]}>Burada tam uygulama menüsü yer alacak.</Text>
        <PrimaryButton
          label="Ana Sayfaya Dön"
          variant="outline"
          onPress={() => navigation.navigate('AnaSayfa')}
        />
      </View>
    </SafeAreaView>
  );
};

export default BasicMainMenuScreen;