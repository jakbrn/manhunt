import { useJoinGame } from "@/api/games";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ChevronLeftIcon } from "lucide-nativewind";
import { useEffect, useState } from "react";
import { Alert, SafeAreaView, View } from "react-native";

export default function JoinGameScreen() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const joinGame = useJoinGame();
  const { gameCode: prefilledGameCode } = useLocalSearchParams<{ gameCode?: string }>();

  useEffect(() => {
    if (prefilledGameCode?.trim()) {
      setCode(prefilledGameCode);
    }
  }, [prefilledGameCode]);

  async function process() {
    if (!code.trim() || !name.trim()) {
      Alert.alert("Please enter both game code and your name.");
      return;
    }

    try {
      const data = await joinGame.mutateAsync({ name, code });
      router.dismissTo(`/\(app\)/games/${data.id}`);
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred while joining the game.");
    }
  }

  return (
    <View className="flex-1 items-center gap-4 p-4">
      <Stack.Screen
        options={{
          header: () => {
            return (
              <SafeAreaView>
                <View className="flex-row items-center gap-2 pt-2 px-4">
                  <Button variant="ghost" size="icon" onPress={() => router.back()}>
                    <ChevronLeftIcon size={24} className="text-primary" />
                  </Button>
                  <Text className="text-2xl font-semibold flex-1">Join Game</Text>
                </View>
              </SafeAreaView>
            );
          },
        }}
      />
      <View className="flex-col items-center gap-2 w-full flex-1">
        <View className="w-full flex flex-col gap-1">
          <Text className="font-semibold ml-1">Game Code</Text>
          <Input
            placeholder="Enter game code"
            value={code}
            onChangeText={setCode}
            className="w-full"
            autoCapitalize="none"
            editable={!prefilledGameCode}
          />
        </View>
        <View className="w-full flex flex-col gap-1">
          <Text className="font-semibold ml-1">Your Name</Text>
          <Input placeholder="Enter your name" value={name} onChangeText={setName} className="w-full" />
        </View>
        <Button onPress={process} disabled={joinGame.isPending} className="w-full mt-4" size="lg">
          <Text className="font-semibold text-base">{joinGame.isPending ? "Joining..." : "Join"}</Text>
        </Button>
      </View>
    </View>
  );
}
