import { useSession } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function usePlayers(gameId: number) {
  const queryClient = useQueryClient();
  const { session } = useSession();

  function invalidatePlayers() {
    queryClient.invalidateQueries({ queryKey: ["players", gameId] });
  }

  useEffect(() => {
    if (!session) return;

    const channelName = `players-${gameId}`;
    const channel = supabase.channel(channelName);

    channel.on("postgres_changes", { event: "*", schema: "public", table: "players" }, () => {
      invalidatePlayers();
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, supabase, gameId]);

  return useQuery({
    queryKey: ["players", gameId],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const { data } = await supabase.from("players").select("*").eq("game_id", gameId);
      return data || [];
    },
  });
}
