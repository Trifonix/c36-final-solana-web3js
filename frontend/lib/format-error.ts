export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message || error.name;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const message = Reflect.get(error, "message");

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    try {
      const serialized = JSON.stringify(error);

      if (serialized && serialized !== "{}") {
        return serialized;
      }
    } catch {
      // Fall through to the safe generic message.
    }
  }

  return "Не удалось выполнить операцию. Попробуйте ещё раз.";
}
