export function requestConfirmation(message: string): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return window.confirm(message);
}
