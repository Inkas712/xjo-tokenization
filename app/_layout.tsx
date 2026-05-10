// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { CryptoProvider } from "@/contexts/CryptoContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isRegistered, isLoading } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const isOnRegistration = segments[0] === 'registration';

    if (!isRegistered && !isOnRegistration) {
      router.replace('/registration');
      return;
    }

    if (isRegistered && isOnRegistration) {
      router.replace('/(tabs)');
    }
  }, [isRegistered, isLoading, segments, router]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="registration" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="qr-entry" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="qr-scanner" options={{ headerShown: false, presentation: "fullScreenModal" }} />
      <Stack.Screen name="qr-receive" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="all-assets" options={{ headerShown: false }} />
      <Stack.Screen name="asset-detail" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CryptoProvider>
        <UserProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </UserProvider>
      </CryptoProvider>
    </QueryClientProvider>
  );
}
