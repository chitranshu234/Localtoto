import client from "./api/client";
let cachedKey: string | null | undefined = undefined;
let pendingRequest: Promise<string | null> | null = null;

export async function getRazorpayKey(forceRefresh = false): Promise<string | null> {
  if (!forceRefresh && cachedKey !== undefined) {
    return cachedKey;
  }

  if (pendingRequest && !forceRefresh) {
    return pendingRequest;
  }

  pendingRequest = (async () => {
    try {
      const res = await client.get('/payments/config');
      if (res.data?.success && typeof res.data.key === 'string') {
        cachedKey = res.data.key;
        return cachedKey;
      }
      cachedKey = null;
      return null;
    } catch (error) {
      cachedKey = null;
      throw error;
    } finally {
      pendingRequest = null;
    }
  })();

  return pendingRequest;
}

export function clearCachedRazorpayKey() {
  cachedKey = undefined;
  pendingRequest = null;
}

