"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

export function DatePicker({ dateStr }: { dateStr: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const selectedDate = new Date(dateStr + "T00:00:00");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("utcOffset")) {
      const today = new Date();
      const localDateStr = params.get("date") ?? format(today, "yyyy-MM-dd");
      const offset = new Date(`${localDateStr}T00:00:00`).getTimezoneOffset();
      params.set("utcOffset", String(offset));
      if (!params.has("date")) {
        params.set("date", localDateStr);
      }
      router.replace(`/dashboard?${params.toString()}`);
    }
  }, [router]);

  return (
    <div className="mb-8 flex items-center justify-between">
      <h2 className="text-2xl font-bold tracking-tight">
        {formatDate(selectedDate)}
      </h2>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-50 justify-start text-left font-normal")}
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
                const dateStr = format(date, "yyyy-MM-dd");
                const offset = date.getTimezoneOffset();
                router.push(
                  `/dashboard?date=${dateStr}&utcOffset=${offset}`
                );
                setOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
