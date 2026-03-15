import { NextResponse } from "next/server";

import { apiErrorResponse, requireApiKey } from "@/lib/api";
import { getFavoritesData } from "@/lib/server/component-service";

export async function GET(request: Request) {
  try {
    const auth = await requireApiKey(request);
    const favorites = await getFavoritesData(auth.user.id);

    return NextResponse.json({
      favorites,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
