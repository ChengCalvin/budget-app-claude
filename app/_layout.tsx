import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { initializeFirebase } from '../src/services/firebaseInit';
import { AuthProvider } from '../src/contexts/authContext';
import { useAuth } from '../src/features/authentication/hooks/useAuth';

function StackNavigator() {
  function LogoutButton() {
    const { logout } = useAuth();

    const handleLogout = () => {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: logout },
        ]
      );
    };

    return (
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Stack>
      <Stack.Screen
        name="signin"
        options={{
          title: 'Sign In',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="index"
        options={{
          title: 'Transactions',
          headerShown: true,
          headerRight: () => <LogoutButton />
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    initializeFirebase();
  }, []);

  return (
    <AuthProvider>
      <StackNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF5722',
    borderRadius: 6,
    marginRight: 10,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});