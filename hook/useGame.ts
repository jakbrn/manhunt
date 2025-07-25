import { useSession } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function useGame(gameId: number) {
  const { session } = useSession();
  const queryClient = useQueryClient();

  function invalidateGame() {
    queryClient.invalidateQueries({ queryKey: ["game", gameId] });
  }

  useEffect(() => {
    if (!session) return;

    const channelName = `game-${gameId}-${session.user.id}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "games" }, () => invalidateGame());
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, gameId]);

  return useQuery({
    queryKey: ["game", gameId],
    queryFn: async () => {
      const { data } = await supabase.from("games").select("*").eq("id", gameId).single();
      return data;
    },
  });
}
