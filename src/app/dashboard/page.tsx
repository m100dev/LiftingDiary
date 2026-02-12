import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Dumbbell, Plus } from "lucide-react";

import { WorkoutTime } from "./workout-time";

import { getWorkoutsForDate } from "@/data/workouts";
import { DatePicker } from "./date-picker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; utcOffset?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const { date, utcOffset } = await searchParams;
  const offsetMinutes = utcOffset ? parseInt(utcOffset, 10) : 0;
  const selectedDate = date ? new Date(date + "T00:00:00") : new Date();
  const dateStr = date ?? format(selectedDate, "yyyy-MM-dd");

  const workouts = await getWorkoutsForDate(userId, dateStr, offsetMinutes);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <DatePicker dateStr={dateStr} />

      <Button asChild className="mb-6 w-full">
        <Link href={`/dashboard/workout/new?date=${dateStr}`}>
          <Plus className="mr-2 size-4" />
          Create New Workout
        </Link>
      </Button>

      {workouts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="mb-4 size-10 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              No workouts on this day
            </p>
            <p className="text-sm text-muted-foreground">
              Select a different date or start a new workout.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {workout.name ?? "Workout"}
                  </CardTitle>
                  <Badge
                    variant={workout.completedAt ? "default" : "secondary"}
                  >
                    {workout.completedAt ? "Completed" : "In Progress"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <WorkoutTime
                    startedAt={workout.startedAt.toISOString()}
                    completedAt={workout.completedAt?.toISOString() ?? null}
                  />
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {workout.workoutExercises.map((we) => (
                  <div key={we.id}>
                    <h4 className="mb-2 text-sm font-semibold">
                      {we.exercise.name}
                    </h4>
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="px-3 py-1.5 text-left font-medium">
                              Set
                            </th>
                            <th className="px-3 py-1.5 text-right font-medium">
                              Weight (kg)
                            </th>
                            <th className="px-3 py-1.5 text-right font-medium">
                              Reps
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {we.sets.map((set) => (
                            <tr
                              key={set.id}
                              className="border-b last:border-0"
                            >
                              <td className="px-3 py-1.5">{set.setNumber}</td>
                              <td className="px-3 py-1.5 text-right">
                                {set.weight}
                              </td>
                              <td className="px-3 py-1.5 text-right">
                                {set.reps}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
