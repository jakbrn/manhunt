import { useSession } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function useGames() {
  const queryClient = useQueryClient();
  const { session } = useSession();

  function invalidateGames() {
    queryClient.invalidateQueries({ queryKey: ["games"] });
  }

  useEffect(() => {
    if (!session) return;

    const channelName = `games`;
    const channel = supabase.channel(channelName);

    invalidateGames();

    channel
      .on("postgres_changes", { event: "*", schema: "public", table: "games" }, () => invalidateGames())
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, () => invalidateGames())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  return useQuery({
    queryKey: ["games"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const { data } = await supabase.from("games").select("*");
      return data || [];
    },
  });
}
