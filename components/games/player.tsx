import { Database, Tables } from "@/database.types";
import useGame from "@/hook/useGame";
import { useSession } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { ArrowLeftRightIcon, LocateIcon, TrashIcon } from "lucide-nativewind";
import { useState } from "react";
import { View } from "react-native";
import MapView from "react-native-maps";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Text } from "../ui/text";
import RoleBadge from "./role";

export default function PlayerEntry({
  player,
  mapView,
  as,
}: {
  player: Tables<"players">;
  mapView: React.RefObject<MapView | null>;
  as: Database["public"]["Enums"]["role"];
}) {
  const { session } = useSession();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { data: game } = useGame(parseInt(gameId));
  const [dialog, setDialog] = useState(false);

  const isOwner = session?.user.id === game?.owner;
  const canLocate = player.position && (player.role === as || as !== "runner");

  async function swapFunction() {
    if (!session) return;

    const newRole = player.role === "hunter" ? "runner" : "hunter";
    await supabase.from("players").update({ role: newRole }).eq("id", player.id);
  }

  async function deletePlayer() {
    if (!session) return;
    setDialog(false);
    const { error } = await supabase.from("players").delete().eq("id", player.id);
    if (error) {
      console.error("Error deleting player:", error);
      return;
    }
  }

  function animateToPlayer() {
    setDialog(false);
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

  return (
    <Dialog open={dialog} onOpenChange={setDialog}>
      <DialogTrigger>
        <View className="flex-row items-center gap-3 w-full p-4 bg-secondary rounded-lg">
          <Text className="font-bold text-lg">{player.name}</Text>
          <RoleBadge role={player.role} />
          {player.user_id === session?.user.id && (
            <Badge className="bg-blue-500">
              <Text className="text-white">You</Text>
            </Badge>
          )}
        </View>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3">
          <DialogTitle>{player.name}</DialogTitle>
          <RoleBadge role={player.role} />
        </DialogHeader>
        {isOwner ||
          (canLocate && (
            <Button variant="outline" className="w-full" onPress={() => animateToPlayer()}>
              <LocateIcon size={16} className="text-primary" />
              <Text className="text-base">Locate</Text>
            </Button>
          ))}
        {isOwner && (
          <>
            <Button className="w-full" onPress={() => swapFunction()}>
              <ArrowLeftRightIcon size={16} className="text-primary-foreground" />
              <Text className="text-base">Swap Role</Text>
            </Button>
            <Button variant="destructive" className="w-full" onPress={() => deletePlayer()}>
              <TrashIcon size={16} className="text-white" />
              <Text className="text-base">Delete Player</Text>
            </Button>
          </>
        )}
        {!isOwner && !canLocate && (
          <Text className="text-center text-sm text-muted-foreground mt-2 w-lg">
            You cannot locate this player because they are a hunter and you are a runner.
          </Text>
        )}
      </DialogContent>
    </Dialog>
  );
}
