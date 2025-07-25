-- Fix recursive policy that causes infinite recursion when deleting/updating players

-- Drop the problematic policies
DROP POLICY IF EXISTS "Game owners can delete players" ON "public"."players";
DROP POLICY IF EXISTS "Game owners can update players" ON "public"."players";

-- Recreate the delete policy (this one was fine)
CREATE POLICY "Game owners can delete players"
ON "public"."players"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((EXISTS ( 
  SELECT 1
  FROM games
  WHERE ((games.id = players.game_id) AND (games.owner = auth.uid()))
)));

-- Recreate the update policy without the recursive WITH CHECK clause
CREATE POLICY "Game owners can update players"
ON "public"."players"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING ((EXISTS ( 
  SELECT 1
  FROM games
  WHERE ((games.id = players.game_id) AND (games.owner = auth.uid()))
)))
WITH CHECK ((EXISTS ( 
  SELECT 1
  FROM games
  WHERE ((games.id = players.game_id) AND (games.owner = auth.uid()))
)));
