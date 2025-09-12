import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useMyPlayers from "@/hook/useMyPlayers";
import { useSession } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useEffect } from "react";
import { Text } from "./ui/text";

if (!TaskManager.isTaskDefined("location-updater")) {
  TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
    "location-updater",
    async ({ data: { locations }, error }) => {
      console.log("Location task triggered");
      if (error) {
        console.error("Location task error:", error);
        return;
      }

      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user) return console.error("User not found");

      const players = await supabase
        .from("players")
        .select("game_id, position")
        .eq("user_id", user.id)
        .then((res) => res.data);
      if (!players) return console.error("Players not found");

      const gamesIds = players.map((player) => player.game_id);
      if (!gamesIds) return console.error("Games IDs not found");

      const games = await supabase
        .from("games")
        .select("id, frequency")
        .in("id", gamesIds)
        .then((res) => res.data);
      if (!games) return console.error("Games not found");

      for (const player of players) {
        const game = games.find((game) => game.id === player.game_id);
        if (!game) continue;

        const position = player.position as Location.LocationObject | null;
        const timestamp = Date.now();
        const frequency = game.frequency * 60000;

        if (position && Math.floor(timestamp / frequency) <= Math.floor(position.timestamp / frequency)) continue;

        for (const location of locations) {
          console.log("Received new location:", location, "For player:", player, " in game:", game.id);
          await supabase
            .from("players")
            .update({
              position: location,
            })
            .eq("user_id", user.id)
            .eq("game_id", game.id);
        }
      }
    }
  );
}

export default function LocationManager() {
  const { session } = useSession();
  const { data: myPlayers } = useMyPlayers();
  const [foregroundLocationStatus, requestForegroundLocationPermission] = Location.useForegroundPermissions();
  const [backgroundLocationStatus, requestBackgroundLocationPermission] = Location.useBackgroundPermissions();
  const haveLocationPermissions = foregroundLocationStatus?.granted && backgroundLocationStatus?.granted;

  useEffect(() => {
    if (!session || !myPlayers || myPlayers.length === 0 || !haveLocationPermissions) return;

    Location.startLocationUpdatesAsync("location-updater", {
      accuracy: Location.Accuracy.High,
      timeInterval: 60000,
      showsBackgroundLocationIndicator: true,
    });

    return () => {
      Location.stopLocationUpdatesAsync("location-updater");
    };
  }, [myPlayers, session, haveLocationPermissions]);

  if (!session) return null;
  if (!myPlayers || myPlayers.length === 0) return null;

  return (
    <AlertDialog open={!haveLocationPermissions}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Location Permission Required</AlertDialogTitle>
          <AlertDialogDescription>
            To use this app, please set location access to always allow. This helps us provide you with the best
            experience, even when the app isn't open.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onPress={async () => {
              await requestForegroundLocationPermission();
              await requestBackgroundLocationPermission();
            }}
          >
            <Text>Grant</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
