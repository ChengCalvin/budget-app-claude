import React from 'react';
import { ExpenseDashboardScreen } from './expenseDashboardScreen';
import { TransactionScreen } from './transactionScreen';

interface HomeScreenProps {}

export const HomeScreen: React.FC<HomeScreenProps> = () => {
  return <TransactionScreen />;
};

export default HomeScreen;