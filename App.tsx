import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/auth/AuthProvider";
import { isSupabaseConfigured } from "./src/lib/supabase";

function AuthScreen() {
  const { user, loading, signIn, signUp, signOut, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    setMessage("");
    if (!email.trim() || !password) return setMessage("Enter your email and password.");
    if (mode === "signup" && !displayName.trim()) return setMessage("Enter a display name.");
    if (password.length < 8) return setMessage("Use a password with at least 8 characters.");
    setBusy(true);
    try {
      if (mode === "signup") {
        const result = await signUp(email, password, displayName);
        setMessage(result.needsEmailConfirmation
          ? "Account created. Check your email to confirm your address, then sign in."
          : "Your KLYVERO account is ready.");
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    if (!email.trim()) return setMessage("Enter your email first, then tap Forgot password.");
    setBusy(true);
    try {
      await sendPasswordReset(email);
      setMessage("If an account exists for that email, a password reset link has been sent.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send the reset email.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color="#D6B875" size="large" /></View>;

  if (user) {
    const displayName = user.user_metadata?.display_name || user.email || "KLYVERO member";
    return (
      <View style={styles.center}>
        <View style={styles.logoMark}><Text style={styles.logoLetter}>K</Text></View>
        <Text style={styles.brand}>KLYVERO</Text>
        <Text style={styles.tagline}>YOUR MARKETPLACE. YOUR STYLE.</Text>
        <View style={styles.welcomeCard}>
          <Text style={styles.eyebrow}>SIGNED IN</Text>
          <Text style={styles.welcome}>Welcome back</Text>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => signOut().catch((e) => setMessage(e.message))}>
            <Text style={styles.primaryButtonText}>Sign out</Text>
          </TouchableOpacity>
          {!!message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <View style={styles.logoMark}><Text style={styles.logoLetter}>K</Text></View>
        <Text style={styles.brand}>KLYVERO</Text>
        <Text style={styles.tagline}>BUY BETTER. SELL SMARTER.</Text>
        <View style={styles.card}>
          <Text style={styles.heading}>{mode === "login" ? "Welcome back" : "Create your account"}</Text>
          <Text style={styles.subheading}>{mode === "login" ? "Sign in to continue to your marketplace." : "Join KLYVERO and make your first move."}</Text>
          {mode === "signup" && (
            <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor="#777B83" style={styles.input} autoCapitalize="words" />
          )}
          <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor="#777B83" style={styles.input} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password (8+ characters)" placeholderTextColor="#777B83" style={styles.input} secureTextEntry autoCapitalize="none" />
          {!!message && <Text style={styles.message}>{message}</Text>}
          <TouchableOpacity style={[styles.primaryButton, busy && styles.disabled]} onPress={submit} disabled={busy}>
            {busy ? <ActivityIndicator color="#111318" /> : <Text style={styles.primaryButtonText}>{mode === "login" ? "Sign in" : "Create account"}</Text>}
          </TouchableOpacity>
          {mode === "login" && <TouchableOpacity onPress={resetPassword} disabled={busy} style={styles.textButton}><Text style={styles.goldText}>Forgot password?</Text></TouchableOpacity>}
          <View style={styles.switchRow}>
            <Text style={styles.muted}>{mode === "login" ? "New to KLYVERO?" : "Already have an account?"}</Text>
            <TouchableOpacity onPress={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>
              <Text style={styles.goldText}> {mode === "login" ? "Create account" : "Sign in"}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.footer}>A fresh way to find your next favourite thing.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AppContent() {
  return (
    <SafeAreaView style={styles.flex}>
      <StatusBar style="light" />
      {!isSupabaseConfigured && (
        <View style={styles.configNotice}>
          <Text style={styles.configText}>Setup needed: add your Supabase URL and key to .env. See README.</Text>
        </View>
      )}
      <AuthScreen />
    </SafeAreaView>
  );
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#0B0D10" },
  screen: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24, paddingVertical: 48 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#0B0D10" },
  logoMark: { width: 54, height: 54, borderRadius: 16, borderWidth: 1, borderColor: "#D6B875", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  logoLetter: { color: "#D6B875", fontSize: 30, fontWeight: "300" },
  brand: { color: "#F5F2EB", fontSize: 25, letterSpacing: 7, fontWeight: "700" },
  tagline: { color: "#9A9DA4", fontSize: 9, letterSpacing: 3, marginTop: 9, marginBottom: 32 },
  card: { width: "100%", maxWidth: 430, backgroundColor: "#15181E", borderColor: "#292D35", borderWidth: 1, borderRadius: 22, padding: 24 },
  welcomeCard: { width: "100%", maxWidth: 430, marginTop: 30, backgroundColor: "#15181E", borderColor: "#292D35", borderWidth: 1, borderRadius: 22, padding: 24 },
  heading: { color: "#F5F2EB", fontSize: 25, fontWeight: "700" },
  subheading: { color: "#9A9DA4", fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 24 },
  input: { backgroundColor: "#0D1015", borderColor: "#30343D", borderWidth: 1, borderRadius: 12, color: "#F5F2EB", paddingHorizontal: 15, paddingVertical: 15, marginBottom: 12, fontSize: 14 },
  primaryButton: { backgroundColor: "#D6B875", borderRadius: 12, minHeight: 52, alignItems: "center", justifyContent: "center", marginTop: 8 },
  primaryButtonText: { color: "#111318", fontWeight: "800", fontSize: 15 },
  disabled: { opacity: 0.6 },
  textButton: { alignItems: "center", padding: 15 },
  goldText: { color: "#D6B875", fontWeight: "700", fontSize: 13 },
  switchRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16, flexWrap: "wrap" },
  muted: { color: "#A4A7AE", fontSize: 13 },
  message: { color: "#E8C982", fontSize: 12, lineHeight: 18, marginVertical: 10 },
  footer: { color: "#737780", fontSize: 11, marginTop: 25, textAlign: "center" },
  configNotice: { backgroundColor: "#332B1B", padding: 10 },
  configText: { color: "#F1D69A", textAlign: "center", fontSize: 12 },
  eyebrow: { color: "#D6B875", fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  welcome: { color: "#F5F2EB", fontSize: 25, fontWeight: "700", marginTop: 8 },
  name: { color: "#D6B875", fontSize: 17, marginTop: 15 },
  email: { color: "#9A9DA4", fontSize: 13, marginTop: 5, marginBottom: 22 },
});
