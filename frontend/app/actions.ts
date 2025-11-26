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
    await pruneGoals();
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
      take: 15,
      select: {
        id: true,
        original: true,
        createdAt: true,
        steps: true,
        complexity: true,
      },
    });
    return goals;
  } catch (error) {
    console.error("Failed to fetch goals:", error);
    return [];
  }
}

export async function deleteGoal(id: string) {
  try {
    await prisma.goal.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete goal:", error);
    return { success: false };
  }
}

async function pruneGoals() {
  try {
    const overflow = await prisma.goal.findMany({
      orderBy: { createdAt: "desc" },
      skip: 15,
      select: { id: true },
    });
    if (overflow.length) {
      await prisma.goal.deleteMany({ where: { id: { in: overflow.map((goal: { id: string }) => goal.id) } } });
    }
  } catch (error) {
    console.error("Failed to prune goals:", error);
  }
}
