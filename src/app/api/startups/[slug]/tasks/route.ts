import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { inMemoryStore, StoredStartupTask } from "@/lib/database/in-memory-store";
import { resolveStartup, verifyStartupAccess } from "@/lib/startups/service";

// GET /api/startups/[slug]/tasks
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const startup = await resolveStartup(slug);
    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    try {
      const tasks = await prisma.startupTask.findMany({
        where: { startupId: startup.id },
        orderBy: { createdAt: "desc" },
      });
      if (tasks && tasks.length > 0) {
        return NextResponse.json({ tasks });
      }
    } catch {
      // fallback
    }

    const stored = inMemoryStore.startups.get(slug) || inMemoryStore.startups.get(startup.id);
    return NextResponse.json({ tasks: stored?.tasks || (startup as any).tasks || [] });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST /api/startups/[slug]/tasks
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const startup = await resolveStartup(slug);
    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    if (!verifyStartupAccess(startup as any, user.id, (user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, status = "TODO", assignedTo, dueDate } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const taskId = `tk-${Date.now()}`;
    const newTask: StoredStartupTask = {
      id: taskId,
      startupId: startup.id,
      title,
      status: status as any,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
    };

    const stored = inMemoryStore.startups.get(slug) || inMemoryStore.startups.get(startup.id);
    if (stored) {
      stored.tasks.unshift(newTask);
    }

    try {
      const dbTask = await prisma.startupTask.create({
        data: {
          startupId: startup.id,
          title,
          status,
          assignedTo: assignedTo || null,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });
      return NextResponse.json({ task: dbTask, success: true }, { status: 201 });
    } catch {
      // fallback
    }

    return NextResponse.json({ task: newTask, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// PATCH /api/startups/[slug]/tasks
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const startup = await resolveStartup(slug);
    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    if (!verifyStartupAccess(startup as any, user.id, (user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { taskId, status, title } = body;

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    const stored = inMemoryStore.startups.get(slug) || inMemoryStore.startups.get(startup.id);
    if (stored) {
      const found = stored.tasks.find((t) => t.id === taskId);
      if (found) {
        if (status) found.status = status;
        if (title) found.title = title;
      }
    }

    try {
      const updated = await prisma.startupTask.update({
        where: { id: taskId },
        data: {
          ...(status && { status }),
          ...(title && { title }),
        },
      });
      return NextResponse.json({ task: updated, success: true });
    } catch {
      // fallback
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
