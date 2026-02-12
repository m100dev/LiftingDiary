"use client";

import { format } from "date-fns";

export function WorkoutTime({
  startedAt,
  completedAt,
}: {
  startedAt: string;
  completedAt: string | null;
}) {
  return (
    <>
      {format(new Date(startedAt), "h:mm a")}
      {completedAt && ` — ${format(new Date(completedAt), "h:mm a")}`}
    </>
  );
}
