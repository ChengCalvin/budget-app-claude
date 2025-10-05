// Route file that imports your existing screen
import { HomeScreen } from '../src/screens/homeScreen';
import { ProtectedRoute } from '../src/components/protectedRoute';

export default function ProtectedHome() {
  return (
    <ProtectedRoute>
      <HomeScreen />
    </ProtectedRoute>
  );
}