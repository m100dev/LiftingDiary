import { db } from "@/db";
import { workouts, exercises, workoutExercises, sets } from "@/db/schema";
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

export async function createWorkout(
  userId: string,
  data: {
    name?: string;
    startedAt?: string;
    exercises: Array<{
      exerciseId?: string;
      exerciseName?: string;
      sets: Array<{ weight: number; reps: number }>;
    }>;
  }
) {
  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      name: data.name || null,
      startedAt: data.startedAt ? new Date(data.startedAt) : new Date(),
    })
    .returning();

  for (let i = 0; i < data.exercises.length; i++) {
    const ex = data.exercises[i];

    let exerciseId = ex.exerciseId;

    if (!exerciseId && ex.exerciseName) {
      const [newExercise] = await db
        .insert(exercises)
        .values({ userId, name: ex.exerciseName })
        .returning();
      exerciseId = newExercise.id;
    }

    if (!exerciseId) continue;

    const [workoutExercise] = await db
      .insert(workoutExercises)
      .values({
        workoutId: workout.id,
        exerciseId,
        order: i + 1,
      })
      .returning();

    if (ex.sets.length > 0) {
      await db.insert(sets).values(
        ex.sets.map((set, j) => ({
          workoutExerciseId: workoutExercise.id,
          setNumber: j + 1,
          weight: set.weight,
          reps: set.reps,
        }))
      );
    }
  }

  return workout;
}
