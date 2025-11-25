"use server";

import { prisma } from "@/lib/prisma";

export async function saveGoal(original: string, steps: string[], complexity: number) {
  try {
    const goal = await prisma.goal.create({
      data: {
        original,
        steps,
        complexity,
      },
    });
    return { success: true, id: goal.id };
  } catch (error) {
    console.error("Failed to save goal:", error);
    return { success: false, error: "Failed to save to database" };
  }
}

export async function getRecentGoals() {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return goals;
  } catch (error) {
    console.error("Failed to fetch goals:", error);
    return [];
  }
}
