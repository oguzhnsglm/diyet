import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';

export function AuthTextInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  toggleSecureEntry,
  keyboardType,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#6b7280"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
        />
        {typeof toggleSecureEntry === 'function' && (
          <Pressable onPress={toggleSecureEntry} style={styles.toggleButton}>
            <Text style={styles.toggleButtonText}>{secureTextEntry ? 'Göster' : 'Gizle'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 14,
  },
  label: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: '#f9fafb',
    fontSize: 15,
    paddingVertical: 10,
  },
  toggleButton: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  toggleButtonText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AuthTextInput;
