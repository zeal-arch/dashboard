/**
 * Shared API fetch utility for admin hooks
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiFetch<T = any>(url: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: { 
        "Content-Type": "application/json",
        ...(init?.headers || {})
      },
      ...init,
    });

    const json = await res.json();

    if (!res.ok) {
      const errorMsg = json.error || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return json;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("An unexpected error occurred during the API call");
  }
}
