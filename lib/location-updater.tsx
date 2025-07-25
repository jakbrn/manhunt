import useGames from "@/hook/useGames";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useEffect } from "react";
import { useSession } from "./auth-context";
import { supabase } from "./supabase";

export default function LocationUpdater() {
  const { session } = useSession();
  const { data: games } = useGames();

  useEffect(() => {
    if (!session || !games || games.length === 0) return;

    const initLocation = async () => {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== "granted") return;
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== "granted") return;

      games.forEach(async (game) => {
        const { data } = await supabase
          .from("players")
          .select("*")
          .eq("game_id", game.id)
          .eq("user_id", session.user.id)
          .single();

        if (!data) return;

        Location.startLocationUpdatesAsync(`location-task-${game.id}`, {
          accuracy: Location.Accuracy.High,
          timeInterval: game.frequency * 60000,
          distanceInterval: 10,
          showsBackgroundLocationIndicator: true,
        });

        TaskManager.defineTask(`location-task-${game.id}`, async ({ data, error }) => {
          if (error) {
            console.error("Location task error:", error);
            return;
          }
          if (data) {
            const { locations } = data as { locations: Location.LocationObject[] };
            const { data: session } = await supabase.auth.getSession();
            const user = session?.session?.user;

            if (!user) {
              console.error("No user session found");
              return;
            }

            locations.forEach(async (location) => {
              console.log("Received new location:", location);
              await supabase
                .from("players")
                .update({
                  position: location,
                })
                .eq("user_id", user.id)
                .eq("game_id", game.id);
            });
          }
        });
      });
    };

    initLocation();

    return () => {
      games.forEach((game) => {
        Location.stopLocationUpdatesAsync(`location-task-${game.id}`);
        TaskManager.unregisterTaskAsync(`location-task-${game.id}`);
      });
    };
  }, [games, session]);

  return null;
}
