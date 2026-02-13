"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Trash2, X, CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
function formatDate(date: Date): string {
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  return `${day}${suffix} ${format(date, "MMM yyyy")}`;
}

type SetEntry = { weight: string; reps: string };

type ExerciseEntry = {
  exerciseId?: string;
  exerciseName: string;
  sets: SetEntry[];
};

export type WorkoutData = {
  id: string;
  name: string | null;
  startedAt: string;
  exercises: Array<{
    exerciseId: string;
    exerciseName: string;
    sets: Array<{ weight: number; reps: number }>;
  }>;
};

export function WorkoutForm({
  existingExercises,
  initialDate,
  mode = "create",
  workoutId,
  initialData,
  onSubmitAction,
}: {
  existingExercises: Array<{ id: string; name: string }>;
  initialDate?: string;
  mode?: "create" | "edit";
  workoutId?: string;
  initialData?: WorkoutData;
  onSubmitAction: (params: {
    workoutId?: string;
    name?: string;
    startedAt: string;
    exercises: Array<{
      exerciseId?: string;
      exerciseName?: string;
      sets: Array<{ weight: number; reps: number }>;
    }>;
  }) => Promise<void>;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [date, setDate] = useState<Date>(() => {
    if (initialData?.startedAt) return new Date(initialData.startedAt);
    if (initialDate) return new Date(initialDate + "T00:00:00");
    return new Date();
  });
  const [time, setTime] = useState(() => {
    if (initialData?.startedAt)
      return format(new Date(initialData.startedAt), "HH:mm");
    return format(new Date(), "HH:mm");
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [exercises, setExercises] = useState<ExerciseEntry[]>(() => {
    if (initialData?.exercises.length) {
      return initialData.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets: ex.sets.map((s) => ({
          weight: String(s.weight),
          reps: String(s.reps),
        })),
      }));
    }
    return [{ exerciseName: "", sets: [{ weight: "", reps: "" }] }];
  });
  const [submitting, setSubmitting] = useState(false);

  function addExercise() {
    setExercises([
      ...exercises,
      { exerciseName: "", sets: [{ weight: "", reps: "" }] },
    ]);
  }

  function removeExercise(index: number) {
    setExercises(exercises.filter((_, i) => i !== index));
  }

  function updateExerciseName(index: number, value: string) {
    const updated = [...exercises];
    const match = existingExercises.find(
      (e) => e.name.toLowerCase() === value.toLowerCase()
    );
    updated[index] = {
      ...updated[index],
      exerciseName: value,
      exerciseId: match?.id,
    };
    setExercises(updated);
  }

  function addSet(exerciseIndex: number) {
    const updated = [...exercises];
    updated[exerciseIndex].sets.push({ weight: "", reps: "" });
    setExercises(updated);
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    const updated = [...exercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter(
      (_, i) => i !== setIndex
    );
    setExercises(updated);
  }

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setExercises(updated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const [hours, minutes] = time.split(":").map(Number);
      const startedAt = new Date(date);
      startedAt.setHours(hours, minutes, 0, 0);

      await onSubmitAction({
        workoutId,
        name: name || undefined,
        startedAt: startedAt.toISOString(),
        exercises: exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseId ? undefined : ex.exerciseName,
          sets: ex.sets.map((s) => ({
            weight: parseFloat(s.weight),
            reps: parseInt(s.reps, 10),
          })),
        })),
      });

      router.push("/dashboard");
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="workout-name">Workout Name (optional)</Label>
        <Input
          id="workout-name"
          placeholder="e.g. Push Day, Leg Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal")}
              >
                <CalendarIcon className="mr-2 size-4" />
                {formatDate(date)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    setDate(d);
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="start-time">Start Time</Label>
          <Input
            id="start-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        {exercises.map((exercise, exIdx) => (
          <Card key={exIdx}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Exercise {exIdx + 1}
                </CardTitle>
                {exercises.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExercise(exIdx)}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`exercise-name-${exIdx}`}>
                  Exercise Name
                </Label>
                <Input
                  id={`exercise-name-${exIdx}`}
                  placeholder="e.g. Bench Press, Squat"
                  value={exercise.exerciseName}
                  onChange={(e) => updateExerciseName(exIdx, e.target.value)}
                  list={`exercises-list-${exIdx}`}
                  required
                />
                <datalist id={`exercises-list-${exIdx}`}>
                  {existingExercises.map((ex) => (
                    <option key={ex.id} value={ex.name} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label>Sets</Label>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="px-3 py-1.5 text-left font-medium">
                          Set
                        </th>
                        <th className="px-3 py-1.5 text-left font-medium">
                          Weight (kg)
                        </th>
                        <th className="px-3 py-1.5 text-left font-medium">
                          Reps
                        </th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.sets.map((set, setIdx) => (
                        <tr
                          key={setIdx}
                          className="border-b last:border-0"
                        >
                          <td className="px-3 py-1.5 text-muted-foreground">
                            {setIdx + 1}
                          </td>
                          <td className="px-3 py-1.5">
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              placeholder="0"
                              value={set.weight}
                              onChange={(e) =>
                                updateSet(exIdx, setIdx, "weight", e.target.value)
                              }
                              required
                              className="h-8"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <Input
                              type="number"
                              min="1"
                              placeholder="0"
                              value={set.reps}
                              onChange={(e) =>
                                updateSet(exIdx, setIdx, "reps", e.target.value)
                              }
                              required
                              className="h-8"
                            />
                          </td>
                          <td className="px-1.5">
                            {exercise.sets.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => removeSet(exIdx, setIdx)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSet(exIdx)}
                >
                  <Plus className="mr-1 size-3.5" />
                  Add Set
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={addExercise}
      >
        <Plus className="mr-2 size-4" />
        Add Exercise
      </Button>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting
            ? mode === "edit"
              ? "Saving..."
              : "Creating..."
            : mode === "edit"
              ? "Save Changes"
              : "Create Workout"}
        </Button>
      </div>
    </form>
  );
}
