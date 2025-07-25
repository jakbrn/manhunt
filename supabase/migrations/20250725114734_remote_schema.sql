create policy "Game owners can delete players"
on "public"."players"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM games
  WHERE ((games.id = players.game_id) AND (games.owner = ( SELECT auth.uid() AS uid))))));


create policy "Game owners can update players"
on "public"."players"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM games
  WHERE ((games.id = players.game_id) AND (games.owner = ( SELECT auth.uid() AS uid))))))
with check ((game_id = ( SELECT players_1.game_id
   FROM players players_1
  WHERE (players_1.id = players_1.id))));



