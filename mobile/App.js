import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/contexts/AuthContext';
import Router from './src/navigation/Router';

// Ponto de entrada: envolve o app no provedor de autenticação
// e no roteador de navegação.
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Router />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
