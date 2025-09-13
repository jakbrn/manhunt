import { usePlayers } from "@/api/players";
import { Tables } from "@/database.types";
import { useSession } from "@/lib/auth-context";
import { Link } from "expo-router";
import { UserIcon } from "lucide-nativewind";
import { View } from "react-native";
import { Badge } from "../ui/badge";
import { Text } from "../ui/text";

export default function GameEntry({ game }: { game: Tables<"games"> }) {
  const { session } = useSession();
  const { data: players } = usePlayers(game.id);

  return (
    <Link key={game.id} href={`/(app)/games/${game.id}`} className="w-full">
      <View className="p-4 border-border border rounded-lg w-full justify-between gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-semibold flex-1">{game.name}</Text>
          {game.owner === session?.user.id && (
            <>
              {players && players.some((player: Tables<"players">) => player.user_id === session?.user.id) && (
                <Badge className="bg-blue-500">
                  <Text className="text-white font-bold">Player</Text>
                </Badge>
              )}
              <Badge>
                <Text className="font-bold">Owner</Text>
              </Badge>
            </>
          )}
        </View>
        <View className="flex-row items-center gap-2 justify-between">
          <Text className="text-muted-foreground text-sm">
            {game.created_at ? new Date(game.created_at).toLocaleDateString("pl-PL") : "Unknown date"}
          </Text>
          <View className="flex flex-row gap-1 items-center">
            <UserIcon className="text-muted-foreground" size={12} />
            <Text className="text-muted-foreground text-sm">{players?.length ?? 0}</Text>
          </View>
        </View>
      </View>
    </Link>
  );
}
