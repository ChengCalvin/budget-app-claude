import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
  value: string;
  onDateChange: (date: string) => void;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onDateChange,
  error,
  minimumDate = new Date('2008-01-01'),
  maximumDate,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const selectedDate = new Date(value || new Date());

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');

    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      onDateChange(dateString);
    }
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.dateButton,
          error && styles.dateButtonError,
        ]}
        onPress={showDatePicker}
      >
        <Text style={styles.dateText}>
          {formatDate(selectedDate)}
        </Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonError: {
    borderColor: '#FF5722',
  },
  dateText: {
    fontSize: 16,
    color: '#333333',
  },
  calendarIcon: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#FF5722',
    marginTop: 4,
  },
  iosDatePicker: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
});