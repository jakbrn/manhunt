import { useGames } from "@/api/games";
import { AddGameButton } from "@/components/games/add-game-button";
import GameEntry from "@/components/games/game";
import { Text } from "@/components/ui/text";
import { Tabs } from "expo-router";
import { SafeAreaView, View } from "react-native";

export default function GamesScreen() {
  const { data: games } = useGames();

  return (
    <View className="flex-1 items-center gap-4 p-4">
      <Tabs.Screen
        options={{
          header: () => {
            return (
              <SafeAreaView>
                <View className="flex-row items-center gap-2 pt-2 px-4 pl-6 android:mt-safe">
                  <View className="h-10 flex-1 justify-center">
                    <Text className="text-2xl font-semibold">Games</Text>
                  </View>
                  <AddGameButton />
                </View>
              </SafeAreaView>
            );
          },
        }}
      />
      <View className="flex-1 h-0 overflow-auto gap-3 w-full">
        {games?.map((game) => (
          <GameEntry key={game.id} game={game} />
        ))}
        {games?.length === 0 && <Text className="text-center text-muted-foreground">No games found.</Text>}
      </View>
    </View>
  );
}
