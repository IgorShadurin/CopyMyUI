import { NextResponse } from "next/server";

import { getI18n, translateServerError } from "@/i18n/server";
import { getViewer } from "@/lib/viewer";
import { toggleComponentFavorite } from "@/lib/server/component-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ componentId: string }> }
) {
  const { messages } = await getI18n();
  const viewer = await getViewer();

  if (!viewer) {
    return NextResponse.json({ error: messages.errors.api.signInToFavorite }, { status: 401 });
  }

  try {
    const { componentId } = await params;
    const result = await toggleComponentFavorite(componentId, viewer.id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? translateServerError(error.message, messages)
            : messages.errors.api.unableToFavorite,
      },
      { status: 400 }
    );
  }
}
