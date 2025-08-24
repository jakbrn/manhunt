import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { router, Stack } from "expo-router";
import { ChevronLeftIcon } from "lucide-nativewind";
import { useState } from "react";
import { Alert, SafeAreaView, View } from "react-native";

export default function CreateGameScreen() {
  const [gameCode, setGameCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function createGame() {
    if (!gameCode.trim() || !name.trim()) {
      Alert.alert("Please enter both game code and your name.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("games")
        .insert({
          name,
          code: gameCode,
        })
        .select()
        .single();
      if (error) {
        Alert.alert("Error creating game", error.message);
      } else if (data) {
        console.log("Game created:", data);
        router.replace(`/\(app\)/games/${data.id}`);
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred while joining the game.");
    } finally {
      setLoading(false);
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
                  <Text className="text-2xl font-semibold flex-1">Create Game</Text>
                </View>
              </SafeAreaView>
            );
          },
        }}
      />
      <View className="flex-col items-center gap-2 w-full">
        <View className="w-full flex flex-col gap-1">
          <Text className="font-semibold ml-1">Game Name</Text>
          <Input placeholder="Game name" value={name} onChangeText={setName} className="w-full" />
        </View>
        <View className="w-full flex flex-col gap-1">
          <Text className="font-semibold ml-1">Game Code</Text>
          <Input
            placeholder="Enter game code"
            value={gameCode}
            onChangeText={setGameCode}
            className="w-full"
            autoCapitalize="none"
          />
        </View>
        <Button onPress={createGame} disabled={loading} className="w-full mt-4" size="lg">
          <Text className="font-semibold text-base">{loading ? "Creating..." : "Create"}</Text>
        </Button>
      </View>
    </View>
  );
}
