"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteWorkoutAction } from "./actions";

export function DeleteWorkoutButton({ workoutId, workoutDate }: { workoutId: string; workoutDate: Date }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this workout?")) return;

    setDeleting(true);
    try {
      await deleteWorkoutAction({ workoutId });
      const dateStr = format(workoutDate, "yyyy-MM-dd");
      const offset = workoutDate.getTimezoneOffset();
      router.push(`/dashboard?date=${dateStr}&utcOffset=${offset}`);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="mr-1 size-4" />
      {deleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
