drop policy "Players can view their games" on "public"."games";

alter table "public"."games" alter column "owner" set default auth.uid();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.can_view_game(game_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE 
    user_id uuid;
    is_game_player boolean;
BEGIN
    -- Get the current user's ID
    user_id := auth.uid();

    -- Check if the user is a player in this game
    SELECT EXISTS (
        SELECT 1 
        FROM public.players gp
        WHERE gp.game_id = can_view_game.game_id 
        AND gp.user_id = user_id
    ) INTO is_game_player;

    RETURN is_game_player;
END;
$function$
;

create policy "Players can view their own games"
on "public"."games"
as permissive
for select
to anon
using (can_view_game(id));



