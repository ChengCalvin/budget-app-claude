import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface AmountInputProps {
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  currency?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onValueChange,
  error,
  placeholder = '0.00',
  currency = 'USD',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const formatDisplayValue = (val: string): string => {
    if (!val) return '';

    // Remove any non-numeric characters except decimal point
    const numericValue = val.replace(/[^0-9.]/g, '');

    // Handle decimal places (max 2)
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts[1];
    }
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }

    return numericValue;
  };

  const handleValueChange = (text: string) => {
    const formattedValue = formatDisplayValue(text);
    onValueChange(formattedValue);
  };

  const handleNumberPadPress = (digit: string) => {
    if (digit === '.') {
      if (!value.includes('.')) {
        handleValueChange(value + digit);
      }
    } else if (digit === 'backspace') {
      handleValueChange(value.slice(0, -1));
    } else {
      // Check decimal places limit
      const parts = value.split('.');
      if (parts.length === 2 && parts[1].length >= 2) {
        return; // Don't add more digits after 2 decimal places
      }
      handleValueChange(value + digit);
    }
  };

  const getCurrencySymbol = (currencyCode: string): string => {
    switch (currencyCode) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return '$';
    }
  };

  return (
    <View style={styles.container}>
      {/* Amount Display */}
      <TouchableOpacity
        style={[
          styles.amountContainer,
          isFocused && styles.amountContainerFocused,
          error && styles.amountContainerError,
        ]}
        onPress={() => {
          setIsFocused(true);
          inputRef.current?.focus();
        }}
      >
        <Text style={styles.currencySymbol}>
          {getCurrencySymbol(currency)}
        </Text>
        <TextInput
          ref={inputRef}
          style={styles.amountInput}
          value={value}
          onChangeText={handleValueChange}
          placeholder={placeholder}
          placeholderTextColor="#CCCCCC"
          keyboardType="decimal-pad"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="done"
          selectTextOnFocus
        />
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Custom Number Pad (Optional - for better UX) */}
      {isFocused && (
        <View style={styles.numberPad}>
          <View style={styles.numberPadRow}>
            {['1', '2', '3'].map((digit) => (
              <TouchableOpacity
                key={digit}
                style={styles.numberPadButton}
                onPress={() => handleNumberPadPress(digit)}
              >
                <Text style={styles.numberPadButtonText}>{digit}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.numberPadRow}>
            {['4', '5', '6'].map((digit) => (
              <TouchableOpacity
                key={digit}
                style={styles.numberPadButton}
                onPress={() => handleNumberPadPress(digit)}
              >
                <Text style={styles.numberPadButtonText}>{digit}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.numberPadRow}>
            {['7', '8', '9'].map((digit) => (
              <TouchableOpacity
                key={digit}
                style={styles.numberPadButton}
                onPress={() => handleNumberPadPress(digit)}
              >
                <Text style={styles.numberPadButtonText}>{digit}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.numberPadRow}>
            <TouchableOpacity
              style={styles.numberPadButton}
              onPress={() => handleNumberPadPress('.')}
            >
              <Text style={styles.numberPadButtonText}>.</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.numberPadButton}
              onPress={() => handleNumberPadPress('0')}
            >
              <Text style={styles.numberPadButtonText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.numberPadButton, styles.backspaceButton]}
              onPress={() => handleNumberPadPress('backspace')}
            >
              <Text style={styles.numberPadButtonText}>⌫</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => {
              setIsFocused(false);
              inputRef.current?.blur();
            }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  amountContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  amountContainerFocused: {
    borderColor: '#2196F3',
  },
  amountContainerError: {
    borderColor: '#FF5722',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#666666',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'left',
  },
  errorText: {
    fontSize: 12,
    color: '#FF5722',
    marginTop: 4,
    marginLeft: 4,
  },
  numberPad: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  numberPadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  numberPadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 70,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backspaceButton: {
    backgroundColor: '#FFE0E1',
  },
  numberPadButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  doneButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});