import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getExercises(userId: string) {
  return db
    .select()
    .from(exercises)
    .where(eq(exercises.userId, userId));
}
