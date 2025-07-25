import { Button } from "@/components/ui/button";
import useGame from "@/hook/useGame";
import usePlayers from "@/hook/usePlayers";
import { useSession } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import * as Location from "expo-location";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ChevronLeftIcon, SettingsIcon } from "lucide-nativewind";
import { useEffect } from "react";
import { SafeAreaView, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function GameScreen() {
  const { session } = useSession();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { data: players, isLoading: playersLoading } = usePlayers(parseInt(gameId));
  const { data: game, isLoading: gameLoading } = useGame(parseInt(gameId));

  useEffect(() => {
    if (playersLoading || gameLoading) return;
    if (!players?.some((player) => player.user_id === session?.user.id) && game?.owner !== session?.user.id) {
      router.push(`/(app)`);
    }
  }, [players, playersLoading, game, gameLoading, session, router]);

  const me = players?.find((player) => player.user_id === session?.user.id);

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          header: () => null,
        }}
      />
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {players?.map((player) => {
          const position = player.position as Location.LocationObject;

          if (!position) return null;

          if (player.user_id === session?.user.id)
            return (
              <Marker
                key={player.id}
                title="You"
                coordinate={{
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                }}
              >
                <View className="bg-blue-500 h-5 w-5 rounded-full aspect-square items-center justify-center border border-blue-300" />
              </Marker>
            );

          if (me?.role === "runner" && player.role === "hunter") return null;

          return (
            <Marker
              key={player.id}
              coordinate={{
                latitude: position.coords.latitude || 0,
                longitude: position.coords.longitude || 0,
              }}
              title={player.name}
            >
              <View
                className={cn(
                  "p-1 rounded-full aspect-square items-center justify-center border",
                  player.role === "hunter" ? "bg-red-500 border-red-300" : "bg-green-500 border-green-300"
                )}
              >
                <Text className="text-lg text-white font-bold">{player.name.slice(0, 1).toUpperCase()}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>
      <SafeAreaView className="absolute top-0 left-0 right-0">
        <View className="px-4 flex-row justify-between items-center">
          <Button variant="secondary" onPress={() => router.back()} className="aspect-square">
            <ChevronLeftIcon size={24} className="text-primary" />
          </Button>
          <View className="gap-2">
            <Button
              variant="secondary"
              className="aspect-square"
              onPress={() => router.push(`/(app)/games/${gameId}/settings`)}
            >
              <SettingsIcon size={20} className="text-foreground" />
            </Button>
          </View>
        </View>
        <View className="px-6 w-full justify-between items-end gap-4">
          <View className="gap-2"></View>
        </View>
      </SafeAreaView>
    </View>
  );
}
