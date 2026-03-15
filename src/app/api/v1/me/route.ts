import { NextResponse } from "next/server";

import { apiErrorResponse, requireApiKey } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const auth = await requireApiKey(request);
    const [favoritesCount, purchasesCount] = await Promise.all([
      prisma.favorite.count({
        where: {
          userId: auth.user.id,
        },
      }),
      prisma.componentPurchase.count({
        where: {
          buyerId: auth.user.id,
        },
      }),
    ]);

    return NextResponse.json({
      user: {
        ...auth.user,
        favoritesCount,
        purchasesCount,
      },
      apiKey: auth.apiKey,
      permissions: {
        canPurchase: auth.apiKey.canPurchase,
      },
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
