import { NextResponse } from "next/server";

import { authenticateApiKey } from "@/lib/server/api-key-service";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? null,
        },
      },
      { status: error.status }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: {
          code: "request_failed",
          message: error.message,
          details: null,
        },
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "internal_error",
        message: "Unexpected API failure.",
        details: null,
      },
    },
    { status: 500 }
  );
}

export async function parseApiJson<T>(request: Request) {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(
      400,
      "invalid_json",
      "Request body must be valid JSON."
    );
  }
}

function extractApiKey(request: Request) {
  const authorization = request.headers.get("authorization");
  const apiKeyHeader = request.headers.get("x-api-key");

  if (authorization) {
    const [scheme, token] = authorization.split(/\s+/, 2);

    if (scheme !== "Bearer" || !token?.trim()) {
      throw new ApiError(
        401,
        "invalid_authorization_header",
        "Authorization header must use the Bearer scheme."
      );
    }

    return token.trim();
  }

  if (apiKeyHeader?.trim()) {
    return apiKeyHeader.trim();
  }

  throw new ApiError(
    401,
    "missing_api_key",
    "Provide an API key with `Authorization: Bearer <key>` or `x-api-key`."
  );
}

export async function requireApiKey(
  request: Request,
  options?: { requirePurchasePermission?: boolean }
) {
  const rawKey = extractApiKey(request);
  let auth: Awaited<ReturnType<typeof authenticateApiKey>>;

  try {
    auth = await authenticateApiKey(rawKey);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid API key.") {
      throw new ApiError(
        401,
        "invalid_api_key",
        "The provided API key is invalid or has been deleted."
      );
    }

    throw error;
  }

  if (options?.requirePurchasePermission && !auth.apiKey.canPurchase) {
    throw new ApiError(
      403,
      "purchase_disabled",
      "This API key cannot purchase premium components.",
      {
        canPurchase: false,
      }
    );
  }

  return auth;
}
