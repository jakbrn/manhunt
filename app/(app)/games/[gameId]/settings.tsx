import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import useGame from "@/hook/useGame";
import usePlayers from "@/hook/usePlayers";
import { useSession } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeftRightIcon, ChevronLeftIcon, LogOutIcon, TrashIcon } from "lucide-nativewind";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

export default function GameSettingsScreen() {
  const { session } = useSession();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { data: players } = usePlayers(parseInt(gameId));
  const { data: game } = useGame(parseInt(gameId));

  // Local state for debounced inputs
  const [localName, setLocalName] = useState("");
  const [localCode, setLocalCode] = useState("");
  const [localFrequency, setLocalFrequency] = useState("");

  // Update local state when game data changes
  useEffect(() => {
    if (game) {
      setLocalName(game.name ?? "");
      setLocalCode(game.code ?? "");
      setLocalFrequency(game.frequency?.toString() ?? "");
    }
  }, [game]);

  // Debounced update functions
  const debouncedUpdateName = useCallback(
    debounce((name: string) => updateGameName(name), 500),
    [session, gameId]
  );

  const debouncedUpdateCode = useCallback(
    debounce((code: string) => updateGameCode(code), 500),
    [session, gameId]
  );

  const debouncedUpdateFrequency = useCallback(
    debounce((frequency: string) => updateGameFrequency(frequency), 500),
    [session, gameId]
  );

  // Handle input changes with debouncing
  const handleNameChange = (name: string) => {
    setLocalName(name);
    debouncedUpdateName(name);
  };

  const handleCodeChange = (code: string) => {
    setLocalCode(code);
    debouncedUpdateCode(code);
  };

  const handleFrequencyChange = (frequency: string) => {
    setLocalFrequency(frequency);
    debouncedUpdateFrequency(frequency);
  };

  async function leaveGame() {
    if (!session) return;
    await supabase.from("players").delete().eq("user_id", session.user.id).eq("game_id", parseInt(gameId));
    router.dismissTo("/(app)");
  }

  async function swapFunction(playerId: number) {
    if (!session) return;
    const player = players?.find((p) => p.id === playerId);
    if (!player) return;

    const newRole = player.role === "hunter" ? "runner" : "hunter";
    await supabase.from("players").update({ role: newRole }).eq("id", playerId);
  }

  async function deletePlayer(playerId: number) {
    if (!session) return;
    const { error } = await supabase.from("players").delete().eq("id", playerId);
    if (error) {
      console.error("Error deleting player:", error);
      return;
    }
  }

  async function updateGameName(name: string) {
    if (!session || !isOwner) return;
    await supabase.from("games").update({ name }).eq("id", parseInt(gameId));
  }

  async function updateGameCode(code: string) {
    if (!session || !isOwner) return;
    await supabase.from("games").update({ code }).eq("id", parseInt(gameId));
  }

  async function updateGameFrequency(frequency: string) {
    if (!session || !isOwner) return;
    const numericFrequency = parseInt(frequency);
    if (isNaN(numericFrequency)) return;
    await supabase.from("games").update({ frequency: numericFrequency }).eq("id", parseInt(gameId));
  }

  const isOwner = session?.user.id === game?.owner;

  return (
    <View className="flex-1 items-center gap-4 p-4">
      <Stack.Screen
        options={{
          header: () => {
            return (
              <SafeAreaView>
                <View className="flex-row items-center gap-2 px-4">
                  <Button variant="ghost" size="icon" onPress={() => router.back()}>
                    <ChevronLeftIcon size={24} className="text-primary" />
                  </Button>
                  <Text className="text-2xl font-semibold flex-1">Game Settings</Text>
                </View>
              </SafeAreaView>
            );
          },
        }}
      />
      <View className="flex-col items-center gap-2 w-full">
        <Text className="text-xl font-semibold w-full">Game Name</Text>
        <Input value={localName} editable={isOwner} onChangeText={handleNameChange} className="w-full" />
      </View>
      <View className="flex-col items-center gap-2 w-full">
        <Text className="text-xl font-semibold w-full">Game Code</Text>
        <Input value={localCode} editable={isOwner} onChangeText={handleCodeChange} className="w-full" />
      </View>
      <View className="flex-col items-center gap-2 w-full">
        <Text className="text-xl font-semibold w-full">Frequency (minutes)</Text>
        <Input
          value={localFrequency}
          editable={isOwner}
          keyboardType="numeric"
          onChangeText={handleFrequencyChange}
          className="w-full"
        />
      </View>
      <View className="flex-col items-center gap-2 w-full mb-auto">
        <Text className="text-xl font-semibold w-full">Players</Text>
        {players?.map((player) => (
          <View key={player.id} className="flex-row items-center gap-2 w-full p-4 bg-secondary rounded-lg">
            <Text className="font-bold text-lg">{player.name}</Text>
            {player.role === "hunter" ? (
              <Badge className="bg-red-500">
                <Text className="text-white">Hunter</Text>
              </Badge>
            ) : (
              <Badge className="bg-green-500">
                <Text className="text-white">Runner</Text>
              </Badge>
            )}
            {player.user_id === session?.user.id && (
              <Badge className="bg-blue-500">
                <Text className="text-white">You</Text>
              </Badge>
            )}
            {isOwner && (
              <View className="ml-auto flex-row gap-2 items-center">
                <Button variant="ghost" size="icon" onPress={() => swapFunction(player.id)}>
                  <ArrowLeftRightIcon size={18} className="text-primary" />
                </Button>
                <Button variant="ghost" size="icon" onPress={() => deletePlayer(player.id)}>
                  <TrashIcon size={18} className="text-red-500" />
                </Button>
              </View>
            )}
          </View>
        ))}
      </View>
      {players?.some((player) => player.user_id === session?.user.id) && (
        <Button variant="destructive" className="w-full flex-row gap-2" onPress={() => leaveGame()}>
          <LogOutIcon size={20} className="text-white" />
          <Text>Leave Game</Text>
        </Button>
      )}
      {isOwner && (
        <Button variant="destructive" className="w-full flex-row gap-2" onPress={() => leaveGame()}>
          <TrashIcon size={20} className="text-white" />
          <Text>Delete Game</Text>
        </Button>
      )}
      {/* <View className="flex-1 h-0 overflow-auto gap-2 w-full">
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
      </View> */}
    </View>
  );
}
