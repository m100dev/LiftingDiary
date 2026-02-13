import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getExercises } from "@/data/exercises";
import { WorkoutForm } from "./workout-form";
import { createWorkoutAction } from "./actions";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const { date } = await searchParams;
  const exercises = await getExercises(userId);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">New Workout</h1>
      <WorkoutForm
        existingExercises={exercises.map((e) => ({ id: e.id, name: e.name }))}
        initialDate={date}
        onSubmitAction={async (params) => {
          "use server";
          await createWorkoutAction({
            name: params.name,
            startedAt: params.startedAt,
            exercises: params.exercises,
          });
        }}
      />
    </main>
  );
}
