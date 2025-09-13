import { useDeleteGame, useGame, useLeaveGame, useUpdateGame } from "@/api/games";
import { usePlayers } from "@/api/players";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useSession } from "@/lib/auth-context";
import { router, useLocalSearchParams } from "expo-router";
import { LogInIcon, LogOutIcon, TrashIcon } from "lucide-nativewind";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

export default function GameDetails() {
  const { session } = useSession();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { data: players } = usePlayers(parseInt(gameId));
  const { data: game } = useGame(parseInt(gameId));
  const updateGame = useUpdateGame();
  const deleteGame = useDeleteGame();
  const leaveGame = useLeaveGame();

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

  async function leaveProcess() {
    if (!session) return;
    await leaveGame.mutateAsync(parseInt(gameId));
    if (isOwner) return;
    router.dismissTo("/(app)/(tabs)");
  }

  async function joinGame() {
    if (!session) return;
    router.push(`/(app)/join?gameCode=${game?.code || ""}`);
  }

  async function deleteProcess() {
    if (!session || !isOwner) return;
    await deleteGame.mutateAsync(parseInt(gameId));
    router.dismissTo("/(app)/(tabs)");
  }

  async function updateGameName(name: string) {
    if (!session || !isOwner) return;
    await updateGame.mutateAsync({ id: parseInt(gameId), name });
  }

  async function updateGameCode(code: string) {
    if (!session || !isOwner) return;
    await updateGame.mutateAsync({ id: parseInt(gameId), code });
  }

  async function updateGameFrequency(frequency: string) {
    if (!session || !isOwner) return;
    const numericFrequency = parseInt(frequency);
    if (isNaN(numericFrequency)) return;
    await updateGame.mutateAsync({ id: parseInt(gameId), frequency: numericFrequency });
  }

  const isOwner = session?.user.id === game?.owner;

  return (
    <View className="gap-2">
      <View className="flex-col items-center gap-2 w-full">
        <Text className="font-semibold ml-1 w-full">Game Name</Text>
        <Input value={localName} editable={isOwner} onChangeText={handleNameChange} className="w-full" />
      </View>
      <View className="flex-col items-center gap-2 w-full">
        <Text className="font-semibold ml-1 w-full">Game Code</Text>
        <Input value={localCode} editable={isOwner} onChangeText={handleCodeChange} className="w-full" />
      </View>
      <View className="flex-col items-center gap-2 w-full">
        <Text className="font-semibold ml-1 w-full">Frequency (minutes)</Text>
        <Input
          value={localFrequency}
          editable={isOwner}
          keyboardType="numeric"
          onChangeText={handleFrequencyChange}
          className="w-full"
        />
      </View>
      <View className="gap-4 flex-row mt-4">
        {players?.some((player) => player.user_id === session?.user.id) ? (
          <Button variant="destructive" size="lg" className="flex-1 flex-row gap-2" onPress={() => leaveProcess()}>
            <LogOutIcon size={18} className="text-white" />
            <Text className="text-base">Leave Game</Text>
          </Button>
        ) : (
          <Button variant="default" size="lg" className="flex-1 flex-row gap-2" onPress={() => joinGame()}>
            <LogInIcon size={18} className="text-secondary" />
            <Text className="text-base">Join Game</Text>
          </Button>
        )}
        {isOwner && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg" className="flex-row gap-2 aspect-square">
                <TrashIcon size={18} className="text-white" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Game</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this game? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Text>Cancel</Text>
                </AlertDialogCancel>
                <AlertDialogAction className="bg-red-800 text-white" onPress={() => deleteProcess()}>
                  <Text>Continue</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </View>
    </View>
  );
}
