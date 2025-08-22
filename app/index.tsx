import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Alert, SafeAreaView, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [waitingForOtp, setWaitingForOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) Alert.alert(error.message);

    setWaitingForOtp(true);
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1">
      {!waitingForOtp ? (
        <View className="p-4 flex-1 flex flex-col justify-center">
          <View className="flex flex-col items-center mb-6 gap-2">
            <Text className="text-3xl font-bold text-primary">Welcome</Text>
            <Text className="text-foreground">Choose your login method</Text>
          </View>

          <View className="w-full flex flex-col gap-3">
            <Input
              placeholder="email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
            <Button onPress={signIn} disabled={loading}>
              <Text className="font-medium">Sign In</Text>
            </Button>
            <View className="flex flex-row justify-between items-center gap-3 my-3">
              <View className="flex-1 h-px bg-secondary" />
              <Text className="text-primary uppercase text-sm font-semibold">or continue as</Text>
              <View className="flex-1 h-px bg-secondary" />
            </View>
            <Button
              className="flex-row items-center justify-center gap-2"
              onPress={() => supabase.auth.signInAnonymously()}
              variant="secondary"
            >
              <Text className="font-medium">Guest</Text>
            </Button>
          </View>
          <Text className="text-center text-primary mt-5 mb-2 px-8">
            By continuing, you agree to our <Text className="text-primary underline">Terms of Service</Text> and{" "}
            <Text className="text-primary underline">Privacy Policy</Text>.
          </Text>
        </View>
      ) : (
        <View className="p-4 flex-1 flex flex-col justify-center">
          <View className="flex flex-col items-center mb-6 gap-2">
            <Text className="text-2xl font-bold text-primary">Enter the code</Text>
            <Text className="text-primary">We sent a code to {email}</Text>
          </View>
          <View className="w-full flex flex-col gap-3">
            <Input
              placeholder="Enter the code"
              value={otp}
              onChangeText={setOtp}
              autoCapitalize="none"
              autoComplete="off"
              keyboardType="number-pad"
            />
            <Button onPress={() => supabase.auth.verifyOtp({ email, token: otp, type: "email" })} disabled={loading}>
              <Text className="font-medium">Verify</Text>
            </Button>
            <Button variant="outline" onPress={() => setWaitingForOtp(false)} disabled={loading}>
              <Text className="font-medium">Anuluj</Text>
            </Button>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
