import { AddGameButton } from "@/components/add-game";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import useGames from "@/hook/useGames";
import { useSession } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Link, Stack } from "expo-router";
import { SafeAreaView, View } from "react-native";

export default function JoinGameScreen() {
  const { session } = useSession();
  const { data: games } = useGames();

  return (
    <View className="flex-1 items-center gap-4 p-4">
      <Stack.Screen
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
      <View className="flex-1 h-0 overflow-auto gap-2 w-full">
        {games?.map((game) => (
          <Link key={game.id} href={`/(app)/games/${game.id}`} className="w-full">
            <View className="bg-secondary p-4 rounded-lg shadow-md w-full justify-between gap-1">
              <View className="flex-row items-center gap-4">
                <Text className="text-lg font-semibold">{game.name}</Text>
                {game.owner === session?.user.id && (
                  <Badge>
                    <Text>Owner</Text>
                  </Badge>
                )}
              </View>
              <View className="flex-row items-center gap-2">
                <Text>{game.created_at ? new Date(game.created_at).toLocaleDateString("pl-PL") : "Unknown date"}</Text>
              </View>
            </View>
          </Link>
        ))}
      </View>
      <View className="gap-2 w-full">
        <Button variant="destructive" onPress={() => supabase.auth.signOut()}>
          <Text className="text-primary font-medium">Log out</Text>
        </Button>
      </View>
    </View>
  );
}
