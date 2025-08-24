import { AddGameButton } from "@/components/games/add-game-button";
import { Text } from "@/components/ui/text";
import { Tabs } from "expo-router";
import { SafeAreaView, View } from "react-native";

export default function GamesScreen() {
  return (
    <View className="flex-1 items-center gap-4 p-4">
      <Tabs.Screen
        options={{
          header: () => {
            return (
              <SafeAreaView>
                <View className="flex-row items-center gap-2 px-4">
                  <Text className="text-2xl font-semibold flex-1">Your Games</Text>
                  <AddGameButton />
                </View>
              </SafeAreaView>
            );
          },
        }}
      />
      <Text>Test text</Text>
      {/* <View className="flex-col items-center gap-2 w-full">
        <Input
          placeholder="Game code"
          value={gameCode}
          onChangeText={setGameCode}
          className="w-full"
          autoCapitalize="none"
        />
        <Input placeholder="Your name" value={name} onChangeText={setName} className="w-full" />
        <Button onPress={joinGame} disabled={loading} className="w-full mt-2">
          <Text className="font-medium">{loading ? "Joining..." : "Join"}</Text>
        </Button>
      </View> */}
    </View>
  );
}
