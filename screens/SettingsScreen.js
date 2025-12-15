import React, { useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { DietContext } from '../context/DietContext';
import { useLanguage } from '../context/LanguageContext';
import Svg, { Path } from 'react-native-svg';
import BottomNavBar from '../components/BottomNavBar';
import BackButton from '../components/BackButton';

const SettingsIcon = ({ name, size = 24, color = '#000' }) => {
  const iconPaths = {
    theme: "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z",
    notification: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z",
    language: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z",
    privacy: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z",
    about: "M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
    logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    chevron: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={iconPaths[name]} fill={color} />
    </Svg>
  );
};

const SettingsScreen = ({ navigation }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { user } = useContext(DietContext);
  const { language, changeLanguage, t } = useLanguage();

  const handleLogout = () => {
    Alert.alert(
      t('settingsScreen.logout'),
      t('settingsScreen.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settingsScreen.logout'),
          style: 'destructive',
          onPress: async () => {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.removeItem('isAuthenticated');
            // App.js'teki state'i güncellemek için navigation reset
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          },
        },
      ]
    );
  };

  const handleLanguageChange = () => {
    Alert.alert(
      t('settingsScreen.selectLanguage'),
      '',
      [
        {
          text: t('settingsScreen.turkish'),
          onPress: async () => {
            await changeLanguage('tr');
            Alert.alert(t('settingsScreen.languageChanged'), t('settingsScreen.languageChangedMessage'));
          },
        },
        {
          text: t('settingsScreen.english'),
          onPress: async () => {
            await changeLanguage('en');
            Alert.alert(t('settingsScreen.languageChanged'), t('settingsScreen.languageChangedMessage'));
          },
        },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, showChevron = true, rightComponent }) => (
    <Pressable
      style={[styles.settingItem, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
      android_ripple={{ color: colors.border }}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#f3f4f6' }]}>
          <SettingsIcon name={icon} size={20} color={isDarkMode ? '#0ea5e9' : '#0284c7'} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (showChevron && (
        <SettingsIcon name="chevron" size={20} color={colors.secondaryText} />
      ))}
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <BackButton navigation={navigation} />
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('common.settings')}</Text>
        </View>

        {/* Kullanıcı Bilgisi */}
        <View style={styles.section}>
          <View style={[styles.userCard, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#0ea5e9' : '#3b82f6' }]}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'K'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.name || t('settingsScreen.user')}
              </Text>
              <Text style={[styles.userEmail, { color: colors.secondaryText }]}>
                {user?.email || 'email@example.com'}
              </Text>
            </View>
          </View>
        </View>

        {/* Genel Ayarlar */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>{t('settingsScreen.general')}</Text>
          
          <SettingItem
            icon="theme"
            title={t('settingsScreen.theme')}
            subtitle={isDarkMode ? t('settingsScreen.darkMode') : t('settingsScreen.lightMode')}
            showChevron={false}
            rightComponent={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#d1d5db', true: '#0ea5e9' }}
                thumbColor={isDarkMode ? '#ffffff' : '#f3f4f6'}
              />
            }
          />

          <SettingItem
            icon="notification"
            title={t('settingsScreen.notifications')}
            subtitle={t('settingsScreen.remindersAndAlerts')}
            onPress={() => Alert.alert(t('settingsScreen.notifications'), t('settingsScreen.comingSoon'))}
          />

          <SettingItem
            icon="language"
            title={t('settingsScreen.language')}
            subtitle={language === 'tr' ? t('settingsScreen.turkish') : t('settingsScreen.english')}
            onPress={handleLanguageChange}
          />
        </View>

        {/* Gizlilik ve Güvenlik */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>{t('settingsScreen.privacyAndSecurity')}</Text>
          
          <SettingItem
            icon="privacy"
            title={t('settingsScreen.privacyPolicy')}
            subtitle={t('settingsScreen.dataUsage')}
            onPress={() => Alert.alert(t('settingsScreen.privacy'), t('settingsScreen.comingSoon'))}
          />

          <SettingItem
            icon="about"
            title={t('settingsScreen.termsOfService')}
            subtitle={t('settingsScreen.termsAndConditions')}
            onPress={() => Alert.alert(t('settingsScreen.termsOfService'), t('settingsScreen.comingSoon'))}
          />
        </View>

        {/* Hakkında */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>{t('settingsScreen.about')}</Text>
          
          <SettingItem
            icon="about"
            title={t('settingsScreen.appVersion')}
            subtitle={t('settingsScreen.version')}
            showChevron={false}
            onPress={() => {}}
          />
        </View>

        {/* Çıkış Yap */}
        <View style={styles.section}>
          <Pressable
            style={[styles.logoutButton, { backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2' }]}
            onPress={handleLogout}
            android_ripple={{ color: '#dc2626' }}
          >
            <SettingsIcon name="logout" size={20} color={isDarkMode ? '#fca5a5' : '#dc2626'} />
            <Text style={[styles.logoutText, { color: isDarkMode ? '#fca5a5' : '#dc2626' }]}>
              {t('settingsScreen.logout')}
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavBar navigation={navigation} activeKey="Settings" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
