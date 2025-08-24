import { Database, Tables } from "@/database.types";
import { useSession } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import * as Location from "expo-location";
import { View } from "lucide-react-native";
import { Marker } from "react-native-maps";
import { Text } from "../ui/text";

export default function PlayerMarker({
  as,
  player,
}: {
  as: Database["public"]["Enums"]["role"];
  player: Tables<"players">;
}) {
  const { session } = useSession();
  const position = player.position as Location.LocationObject;

  if (!position) return null;

  if (player.user_id === session?.user.id) return null;
  if (as === "runner" && player.role === "hunter") return null;

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
}
