import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Screen not found</Text>
        <Text style={styles.subtitle}>The page you opened is unavailable.</Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Back to wallet</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F7FBF5",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1C2A22",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B766D",
    textAlign: "center",
    marginBottom: 20,
  },
  link: {
    backgroundColor: "#81C784",
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  linkText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
