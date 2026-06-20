import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { AdminProvider } from "@/context/AdminContext";
import { MedicationProvider } from "@/context/MedicationContext";
import { HealthProvider } from "@/context/HealthContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Shared routes that are accessible from any role
const SHARED_ROUTES = ['role-select', 'virtual-consultation', 'home-visit', 'clinic', '+not-found'];

function RoleRedirect() {
  const { role, isLoading } = useRole();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const base = segments[0] as string | undefined;
    if (!base || SHARED_ROUTES.includes(base)) return;

    if (role === 'patient' && base !== '(tabs)') {
      router.replace('/');
    } else if (role === 'doctor' && base !== 'doctor') {
      router.replace('/doctor');
    } else if (role === 'nurse' && base !== 'nurse') {
      router.replace('/nurse');
    } else if (role === 'admin' && base !== 'admin') {
      router.replace('/admin');
    }
  }, [role, segments, isLoading]);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <RoleRedirect />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="doctor" />
        <Stack.Screen name="nurse" />
        <Stack.Screen name="admin" />
        <Stack.Screen
          name="role-select"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="virtual-consultation" />
        <Stack.Screen name="home-visit" />
        <Stack.Screen name="clinic" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <RoleProvider>
            <AdminProvider>
              <AppProvider>
                <MedicationProvider>
                  <HealthProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <KeyboardProvider>
                        <RootLayoutNav />
                      </KeyboardProvider>
                    </GestureHandlerRootView>
                  </HealthProvider>
                </MedicationProvider>
              </AppProvider>
            </AdminProvider>
          </RoleProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
