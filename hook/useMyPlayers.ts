import { useSession } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function useMyPlayers() {
  const queryClient = useQueryClient();
  const { session } = useSession();

  function invalidatePlayers() {
    queryClient.invalidateQueries({ queryKey: ["my-players"] });
  }

  useEffect(() => {
    if (!session) return;

    const channelName = `my-players-${session.user.id}`;
    const channel = supabase.channel(channelName);

    invalidatePlayers();

    channel.on("postgres_changes", { event: "*", schema: "public", table: "players" }, () => invalidatePlayers()).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  return useQuery({
    queryKey: ["my-players"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      if (!session) return [];
      const { data } = await supabase.from("players").select("*").eq("user_id", session.user.id);
      return data || [];
    },
  });
}
