import { useGame } from "@/api/games";
import { usePlayers } from "@/api/players";
import GameDetails from "@/components/games/details";
import PlayerEntry from "@/components/games/player";
import PlayerMarker from "@/components/games/player-marker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { useSession } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import * as Location from "expo-location";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ChevronDownIcon, ChevronLeftIcon, ChevronUpIcon, LocateIcon } from "lucide-nativewind";
import { useEffect, useRef, useState } from "react";
import { FlatList, SafeAreaView, StatusBar, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

export default function GameScreen() {
  const { session } = useSession();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { data: players, isLoading: playersLoading } = usePlayers(parseInt(gameId));
  const { data: game, isLoading: gameLoading } = useGame(parseInt(gameId));
  const mapView = useRef<MapView>(null);
  const [drawer, setDrawer] = useState(false);
  const [tab, setTab] = useState("players");

  const isOwner = session?.user.id === game?.owner;
  const me = players?.find((player) => player.user_id === session?.user.id);
  const visiblePlayers = (
    isOwner && !me ? players : me && players?.filter((p) => me.role !== "runner" || p.role === me.role)
  )?.filter((p) => p.position);

  useEffect(() => {
    if (playersLoading || gameLoading) return;
    if (me || isOwner) return;
    router.push(`/(app)/(tabs)`);
  }, [players, playersLoading, game, gameLoading, session, router]);

  function fitToMarkers(animated = true) {
    if (!visiblePlayers || visiblePlayers.length === 0) return;
    mapView.current?.fitToCoordinates(
      visiblePlayers.map((p) => ({
        latitude: (p.position as Location.LocationObject)?.coords.latitude || 0,
        longitude: (p.position as Location.LocationObject)?.coords.longitude || 0,
      })),
      {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated,
      }
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          header: () => null,
        }}
      />
      <StatusBar barStyle="dark-content" />
      <View className={cn("p-4 pt-safe", (tab !== "details" || !drawer) && "flex-1")}>
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapView}
          onMapReady={() => fitToMarkers(false)}
          showsCompass
          showsUserLocation
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {visiblePlayers?.map(
            (player) => player.user_id !== session?.user.id && <PlayerMarker key={player.id} player={player} />
          )}
        </MapView>
        <Button variant="secondary" className="aspect-square rounded-full h-14 shadow" onPress={() => router.back()}>
          <ChevronLeftIcon size={24} className="text-primary" />
        </Button>
        <SafeAreaView className="absolute bottom-4 right-4 gap-3">
          {(tab !== "details" || !drawer) && (
            <Button
              variant="secondary"
              className="aspect-square rounded-full h-14 shadow"
              onPress={() => {
                fitToMarkers();
              }}
            >
              <LocateIcon size={24} className="text-primary" />
            </Button>
          )}
          <Button
            variant="secondary"
            className="aspect-square rounded-full h-14 shadow"
            onPress={() => {
              setDrawer(!drawer);
            }}
          >
            {drawer ? (
              <ChevronDownIcon size={24} className="text-primary" />
            ) : (
              <ChevronUpIcon size={24} className="text-primary" />
            )}
          </Button>
        </SafeAreaView>
      </View>
      {drawer && (
        <View className={cn("w-full h-1/2 p-3 px-2 gap-3 bg-background", tab === "details" && "flex-1")}>
          <Tabs value={tab} onValueChange={setTab} className="w-full h-full">
            <TabsList className="w-full h-12">
              <TabsTrigger value="players" className="flex-1 h-full">
                <Text>Players</Text>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex-1 h-full">
                <Text>Details</Text>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="players" className="flex-1 h-0">
              <FlatList
                data={players
                  ?.sort((a, b) => a.name.localeCompare(b.name))
                  .sort((a) => (a.user_id === session?.user.id ? -1 : 1))
                  .sort((a, b) => (a.role === b.role ? -1 : 1))}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({ item }) => <PlayerEntry player={item} mapView={mapView} as={me?.role} />}
                ListEmptyComponent={
                  <Text className="text-muted-foreground text-center text-xl font-semibold py-6">No players yet.</Text>
                }
                contentContainerClassName="gap-2"
              />
            </TabsContent>
            <TabsContent value="details" className="flex-1 h-0">
              <GameDetails />
            </TabsContent>
          </Tabs>
        </View>
      )}
    </>
  );
}
