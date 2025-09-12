import { Tables } from "@/database.types";
import { cn } from "@/lib/utils";
import * as Location from "expo-location";
import { View } from "react-native";
import { Marker } from "react-native-maps";
import { Text } from "../ui/text";

export default function PlayerMarker({ player }: { player: Tables<"players"> }) {
  const position = player.position as Location.LocationObject;
  if (!position) return null;

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
          "p-0.5 rounded-full aspect-square items-center justify-center border-2",
          player.role === "hunter" ? "bg-red-500 border-red-600" : "bg-green-500 border-green-600"
        )}
      >
        <Text className="text-white font-bold text-xs">{player.name.slice(0, 1).toUpperCase()}</Text>
      </View>
    </Marker>
  );
}
