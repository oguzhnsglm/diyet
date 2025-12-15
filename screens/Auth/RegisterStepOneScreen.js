import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthTextInput from '../../components/auth/AuthTextInput';
import AuthButton from '../../components/auth/AuthButton';

const STRINGS = {
  title: 'Kaydol',
  nameLabel: 'Ad / İsim',
  weightLabel: 'Kilo',
  heightLabel: 'Boy',
  waterGoalLabel: 'Günlük Su Hedefi (1 bardak = 250 ml)',
  continue: 'Devam et',
};

const WEIGHT_UNITS = ['kg', 'lb'];
const HEIGHT_UNITS = ['cm', 'ft/in'];

export default function RegisterStepOneScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInch, setHeightInch] = useState('');
  const [waterGoal, setWaterGoal] = useState('8');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [heightUnit, setHeightUnit] = useState('cm');

  const isMetricHeight = heightUnit === 'cm';

  const requiredFilled =
    name.trim().length > 0 &&
    weight.trim().length > 0 &&
    (isMetricHeight
      ? height.trim().length > 0
      : heightFeet.trim().length > 0 && heightInch.trim().length > 0);

  const handleContinue = () => {
    if (!requiredFilled) return;

    const heightValue = isMetricHeight
      ? { unit: 'cm', value: Number(height) }
      : { unit: 'ft_in', value: { ft: Number(heightFeet), inch: Number(heightInch) } };

    const userBasicData = {
      name: name.trim(),
      weight: { unit: weightUnit, value: Number(weight) },
      height: heightValue,
      waterGoal: Number(waterGoal) || 8,
    };

    navigation.navigate('RegisterStepTwo', { userBasicData });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>{STRINGS.title}</Text>

          <AuthTextInput
            label={STRINGS.nameLabel}
            placeholder="Adınız"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <AuthTextInput
                label={STRINGS.weightLabel}
                placeholder="70"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.unitSwitcherContainer}>
              {WEIGHT_UNITS.map((unit) => (
                <Text
                  key={unit}
                  style={[
                    styles.unitChip,
                    weightUnit === unit && styles.unitChipActive,
                  ]}
                  onPress={() => setWeightUnit(unit)}
                >
                  {unit}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex}>
              {isMetricHeight ? (
                <AuthTextInput
                  label={STRINGS.heightLabel}
                  placeholder="170"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
              ) : (
                <View style={styles.row}>
                  <View style={[styles.flex, { marginRight: 6 }]}>
                    <AuthTextInput
                      label="ft"
                      placeholder="5"
                      value={heightFeet}
                      onChangeText={setHeightFeet}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.flex, { marginLeft: 6 }]}>
                    <AuthTextInput
                      label="inch"
                      placeholder="9"
                      value={heightInch}
                      onChangeText={setHeightInch}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}
            </View>
            <View style={styles.unitSwitcherContainer}>
              {HEIGHT_UNITS.map((unit) => (
                <Text
                  key={unit}
                  style={[
                    styles.unitChip,
                    heightUnit === unit && styles.unitChipActive,
                  ]}
                  onPress={() => setHeightUnit(unit)}
                >
                  {unit}
                </Text>
              ))}
            </View>
          </View>

          <AuthTextInput
            label={STRINGS.waterGoalLabel}
            placeholder="8"
            value={waterGoal}
            onChangeText={setWaterGoal}
            keyboardType="numeric"
          />

          <AuthButton
            label={STRINGS.continue}
            onPress={handleContinue}
            disabled={!requiredFilled}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#020617',
    borderRadius: 32,
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#0f172a',
    shadowOpacity: 0.8,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 30 },
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#e5f2ff',
    textAlign: 'center',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  unitSwitcherContainer: {
    marginLeft: 12,
    backgroundColor: '#020617',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingVertical: 4,
    paddingHorizontal: 4,
    flexDirection: 'row',
  },
  unitChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  unitChipActive: {
    backgroundColor: '#38bdf8',
    color: '#0f172a',
  },
});
