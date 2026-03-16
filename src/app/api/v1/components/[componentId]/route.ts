import { NextResponse } from "next/server";

import { ApiError, apiErrorResponse, requireApiKey } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getPublicComponentBySlug } from "@/lib/server/component-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ componentId: string }> }
) {
  try {
    const auth = await requireApiKey(request);
    const { componentId } = await params;
    const componentRef = await prisma.component.findUnique({
      where: { id: componentId },
      select: { slug: true },
    });

    if (!componentRef) {
      throw new ApiError(404, "component_not_found", "Component not found.");
    }

    const component = await getPublicComponentBySlug(componentRef.slug, auth.user);

    if (!component) {
      throw new ApiError(404, "component_not_found", "Component not found.");
    }

    return NextResponse.json({ component });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
