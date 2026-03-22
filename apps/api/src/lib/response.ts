const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
} as const;

export function jsonOk(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    ...init,
    headers: { ...JSON_HEADERS, ...init?.headers },
  });
}

export function jsonError(
  message: string,
  status: number,
  details?: unknown
): Response {
  const body: { error: { message: string; details?: unknown } } = {
    error: { message },
  };
  if (details !== undefined) {
    body.error.details = details;
  }
  return Response.json(body, { status, headers: JSON_HEADERS });
}

export function notFound(message = "Not found"): Response {
  return jsonError(message, 404);
}

export function badRequest(message: string, details?: unknown): Response {
  return jsonError(message, 400, details);
}

export function methodNotAllowed(allowedMethods: string[]): Response {
  return new Response(
    JSON.stringify({
      error: { message: "Method not allowed" },
    }),
    {
      status: 405,
      headers: {
        ...JSON_HEADERS,
        Allow: allowedMethods.join(", "),
      },
    }
  );
}

export function serverError(message = "Internal server error"): Response {
  return jsonError(message, 500);
}
