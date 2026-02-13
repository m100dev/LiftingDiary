"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout, deleteWorkout } from "@/data/workouts";
import { revalidatePath } from "next/cache";

const setSchema = z.object({
  weight: z.number().nonnegative(),
  reps: z.number().int().positive(),
});

const exerciseSchema = z
  .object({
    exerciseId: z.string().uuid().optional(),
    exerciseName: z.string().min(1).max(100).optional(),
    sets: z.array(setSchema).min(1),
  })
  .refine((data) => data.exerciseId || data.exerciseName, {
    message: "Each exercise must have an ID or a name",
  });

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().max(100).optional(),
  startedAt: z.string().datetime(),
  exercises: z.array(exerciseSchema).min(1),
});

export async function updateWorkoutAction(params: {
  workoutId?: string;
  name?: string;
  startedAt: string;
  exercises: Array<{
    exerciseId?: string;
    exerciseName?: string;
    sets: Array<{ weight: number; reps: number }>;
  }>;
}) {
  const validated = updateWorkoutSchema.parse(params);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await updateWorkout(userId, validated.workoutId, {
    name: validated.name,
    startedAt: validated.startedAt,
    exercises: validated.exercises,
  });

  revalidatePath("/dashboard");
}

const deleteWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
});

export async function deleteWorkoutAction(params: { workoutId: string }) {
  const validated = deleteWorkoutSchema.parse(params);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await deleteWorkout(userId, validated.workoutId);
  revalidatePath("/dashboard");
}
