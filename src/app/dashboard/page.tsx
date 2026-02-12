"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";

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

type Set = {
  setNumber: number;
  weight: number;
  reps: number;
};

type Exercise = {
  name: string;
  sets: Set[];
};

type Workout = {
  id: string;
  name: string;
  startedAt: Date;
  completedAt: Date | null;
  exercises: Exercise[];
};

// Mock data keyed by date string (YYYY-MM-DD)
const mockWorkouts: Record<string, Workout[]> = {
  "2026-02-12": [
    {
      id: "1",
      name: "Upper Body Push",
      startedAt: new Date("2026-02-12T09:00:00"),
      completedAt: new Date("2026-02-12T10:15:00"),
      exercises: [
        {
          name: "Bench Press",
          sets: [
            { setNumber: 1, weight: 80, reps: 8 },
            { setNumber: 2, weight: 85, reps: 6 },
            { setNumber: 3, weight: 85, reps: 5 },
          ],
        },
        {
          name: "Overhead Press",
          sets: [
            { setNumber: 1, weight: 50, reps: 8 },
            { setNumber: 2, weight: 50, reps: 7 },
            { setNumber: 3, weight: 50, reps: 6 },
          ],
        },
        {
          name: "Incline Dumbbell Press",
          sets: [
            { setNumber: 1, weight: 30, reps: 10 },
            { setNumber: 2, weight: 30, reps: 9 },
            { setNumber: 3, weight: 32, reps: 8 },
          ],
        },
      ],
    },
  ],
  "2026-02-10": [
    {
      id: "2",
      name: "Lower Body",
      startedAt: new Date("2026-02-10T07:30:00"),
      completedAt: new Date("2026-02-10T08:45:00"),
      exercises: [
        {
          name: "Squat",
          sets: [
            { setNumber: 1, weight: 100, reps: 5 },
            { setNumber: 2, weight: 110, reps: 5 },
            { setNumber: 3, weight: 120, reps: 3 },
          ],
        },
        {
          name: "Romanian Deadlift",
          sets: [
            { setNumber: 1, weight: 80, reps: 10 },
            { setNumber: 2, weight: 85, reps: 8 },
            { setNumber: 3, weight: 85, reps: 8 },
          ],
        },
      ],
    },
  ],
  "2026-02-08": [
    {
      id: "3",
      name: "Upper Body Pull",
      startedAt: new Date("2026-02-08T10:00:00"),
      completedAt: null,
      exercises: [
        {
          name: "Pull-ups",
          sets: [
            { setNumber: 1, weight: 0, reps: 10 },
            { setNumber: 2, weight: 0, reps: 8 },
            { setNumber: 3, weight: 0, reps: 7 },
          ],
        },
        {
          name: "Barbell Row",
          sets: [
            { setNumber: 1, weight: 70, reps: 8 },
            { setNumber: 2, weight: 75, reps: 6 },
            { setNumber: 3, weight: 75, reps: 6 },
          ],
        },
      ],
    },
  ],
};

function getWorkoutsForDate(date: Date): Workout[] {
  const key = format(date, "yyyy-MM-dd");
  return mockWorkouts[key] ?? [];
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const workouts = getWorkoutsForDate(selectedDate);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {formatDate(selectedDate)}
        </h2>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              {formatDate(selectedDate)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

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
                  <CardTitle className="text-lg">{workout.name}</CardTitle>
                  <Badge variant={workout.completedAt ? "default" : "secondary"}>
                    {workout.completedAt ? "Completed" : "In Progress"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(workout.startedAt, "h:mm a")}
                  {workout.completedAt &&
                    ` — ${format(workout.completedAt, "h:mm a")}`}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {workout.exercises.map((exercise) => (
                  <div key={exercise.name}>
                    <h4 className="mb-2 text-sm font-semibold">
                      {exercise.name}
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
                          {exercise.sets.map((set) => (
                            <tr
                              key={set.setNumber}
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
