import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export async function getWorkoutsForDate(userId: string, dateStr: string, utcOffsetMinutes: number = 0) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const dayStart = new Date(Date.UTC(year, month - 1, day) + utcOffsetMinutes * 60 * 1000);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  return db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, dayStart),
      lt(workouts.startedAt, dayEnd)
    ),
    with: {
      workoutExercises: {
        orderBy: (we, { asc }) => [asc(we.order)],
        with: {
          exercise: true,
          sets: {
            orderBy: (s, { asc }) => [asc(s.setNumber)],
          },
        },
      },
    },
  });
}
