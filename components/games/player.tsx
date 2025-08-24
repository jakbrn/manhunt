import { Tables } from "@/database.types";
import useGame from "@/hook/useGame";
import { useSession } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { ArrowLeftRightIcon, LocateIcon, TrashIcon } from "lucide-nativewind";
import { View } from "react-native";
import MapView from "react-native-maps";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/context-menu";
import { Text } from "../ui/text";

export default function PlayerEntry({
  player,
  mapView,
}: {
  player: Tables<"players">;
  mapView: React.RefObject<MapView | null>;
}) {
  const { session } = useSession();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { data: game } = useGame(parseInt(gameId));

  const isOwner = session?.user.id === game?.owner;

  async function swapFunction() {
    if (!session) return;

    const newRole = player.role === "hunter" ? "runner" : "hunter";
    await supabase.from("players").update({ role: newRole }).eq("id", player.id);
  }

  async function deletePlayer() {
    if (!session) return;
    const { error } = await supabase.from("players").delete().eq("id", player.id);
    if (error) {
      console.error("Error deleting player:", error);
      return;
    }
  }

  function animateToPlayer() {
    const position = player.position as Location.LocationObject;
    if (position && mapView?.current) {
      mapView.current.animateToRegion({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }

  function Inner() {
    return (
      <View className="flex-row items-center gap-3 w-full p-4 bg-secondary rounded-lg">
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
        {player.position && (
          <Button variant="ghost" size="icon" onPress={() => animateToPlayer()} className="ml-auto">
            <LocateIcon size={18} className="text-primary" />
          </Button>
        )}
      </View>
    );
  }

  if (!isOwner) return <Inner />;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Inner />
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onPress={() => swapFunction()}>
          <ArrowLeftRightIcon size={18} className="text-primary" />
          <Text className="text-base">Swap Role</Text>
        </ContextMenuItem>
        <ContextMenuItem onPress={() => deletePlayer()}>
          <TrashIcon size={18} className="text-red-500" />
          <Text className="text-base">Delete Player</Text>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
