import React, { useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/auth/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SplashScreen } from './src/components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const onSplashDone = useCallback(() => setShowSplash(false), []);

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
      {showSplash ? <SplashScreen onFinish={onSplashDone} /> : null}
    </AuthProvider>
  );
}
