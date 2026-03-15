import { NextResponse } from "next/server";

import { apiErrorResponse, requireApiKey } from "@/lib/api";
import { setComponentFavorite } from "@/lib/server/component-service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ componentId: string }> }
) {
  try {
    const auth = await requireApiKey(request);
    const { componentId } = await params;
    const result = await setComponentFavorite(componentId, auth.user.id, true);

    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ componentId: string }> }
) {
  try {
    const auth = await requireApiKey(request);
    const { componentId } = await params;
    const result = await setComponentFavorite(componentId, auth.user.id, false);

    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
