import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_SESSION_MAX_AGE } from "@/lib/auth/shared";
import {
  authenticateUser,
  createSessionToken,
  getAuthConfigurationError,
} from "@/lib/auth/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const configurationError = getAuthConfigurationError();
  if (configurationError) {
    return NextResponse.json(
      { error: { message: configurationError } },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid login payload." } },
      { status: 400 }
    );
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const identifier = typeof record.identifier === "string" ? record.identifier : "";
  const password = typeof record.password === "string" ? record.password : "";

  const authenticatedUser = await authenticateUser(identifier, password);
  if (!authenticatedUser) {
    return NextResponse.json(
      { error: { message: "Invalid credentials." } },
      { status: 401 }
    );
  }

  const token = createSessionToken(authenticatedUser);
  const response = NextResponse.json({
    data: {
      user: {
        identifier: authenticatedUser.identifier,
        name: authenticatedUser.name,
        preferredMode: authenticatedUser.preferredMode ?? null,
        preferredEasyRole: authenticatedUser.preferredEasyRole ?? null,
      },
    },
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_SESSION_MAX_AGE,
  });

  return response;
}
