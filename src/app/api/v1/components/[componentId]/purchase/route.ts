import { NextResponse } from "next/server";

import { apiErrorResponse, requireApiKey } from "@/lib/api";
import { purchasePremiumComponent } from "@/lib/server/marketplace-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ componentId: string }> }
) {
  try {
    const auth = await requireApiKey(request, {
      requirePurchasePermission: true,
    });
    const { componentId } = await params;
    const result = await purchasePremiumComponent(componentId, auth.user.id);

    return NextResponse.json({
      purchased: true,
      slug: result.slug,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
