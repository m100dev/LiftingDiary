"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const setSchema = z.object({
  weight: z.number().nonnegative(),
  reps: z.number().int().positive(),
});

const exerciseSchema = z.object({
  exerciseId: z.string().uuid().optional(),
  exerciseName: z.string().min(1).max(100).optional(),
  sets: z.array(setSchema).min(1),
}).refine(
  (data) => data.exerciseId || data.exerciseName,
  { message: "Each exercise must have an ID or a name" }
);

const createWorkoutSchema = z.object({
  name: z.string().max(100).optional(),
  startedAt: z.string().datetime(),
  exercises: z.array(exerciseSchema).min(1),
});

export async function createWorkoutAction(params: {
  name?: string;
  startedAt: string;
  exercises: Array<{
    exerciseId?: string;
    exerciseName?: string;
    sets: Array<{ weight: number; reps: number }>;
  }>;
}) {
  const validated = createWorkoutSchema.parse(params);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await createWorkout(userId, validated);
}
