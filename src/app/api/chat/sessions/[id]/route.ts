import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth-helper";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const session = await prismaClient.chatSession.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: session.id,
      title: session.title,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      messages: session.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        reasoningNodeIds: m.reasoningNodeIds,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to load chat session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prismaClient.chatSession.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 },
      );
    }

    await prismaClient.chatSession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Failed to delete chat session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
