import { useSession } from "@/lib/auth-context";
import { router } from "expo-router";
import { PlusIcon } from "lucide-nativewind";
import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Text } from "./ui/text";

export function AddGameButton() {
  const { session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onPress={() => (session?.user.is_anonymous ? router.push("/(app)/join") : setOpen(true))}
      >
        <PlusIcon size={24} className="text-foreground" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New game</DialogTitle>
            <DialogDescription>
              Choose how you want to add a game. You can create a new game or join an existing one.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col">
            <Button
              variant="outline"
              onPress={() => {
                setOpen(false);
                router.push("/(app)/create");
              }}
            >
              <Text className="font-medium">Create</Text>
            </Button>
            <Button
              onPress={() => {
                setOpen(false);
                router.push("/(app)/join");
              }}
            >
              <Text className="font-medium">Join</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
