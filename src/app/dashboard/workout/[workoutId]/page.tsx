import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";

import { getWorkoutById } from "@/data/workouts";
import { getExercises } from "@/data/exercises";
import { WorkoutForm } from "../new/workout-form";
import { updateWorkoutAction } from "./actions";
import { DeleteWorkoutButton } from "./delete-workout-button";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const { workoutId } = await params;
  const workout = await getWorkoutById(userId, workoutId);

  if (!workout) {
    notFound();
  }

  const exercises = await getExercises(userId);

  const initialData = {
    id: workout.id,
    name: workout.name,
    startedAt: workout.startedAt.toISOString(),
    exercises: workout.workoutExercises.map((we) => ({
      exerciseId: we.exercise.id,
      exerciseName: we.exercise.name,
      sets: we.sets.map((s) => ({
        weight: s.weight,
        reps: s.reps,
      })),
    })),
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Workout</h1>
        <DeleteWorkoutButton workoutId={workoutId} workoutDate={workout.startedAt} />
      </div>
      <WorkoutForm
        existingExercises={exercises.map((e) => ({ id: e.id, name: e.name }))}
        mode="edit"
        workoutId={workoutId}
        initialData={initialData}
        onSubmitAction={updateWorkoutAction}
      />
    </main>
  );
}
