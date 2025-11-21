import { BASE_URL } from "../constants/api";

export interface AdvisoryPayload {
  soil: string;
  waterAvailability: string;
  season: string;
  landSize: string;
  language: string;
  location?: { latitude: number; longitude: number };
}

export async function sendAdvisoryRequest(payload: AdvisoryPayload): Promise<any> {
  if (!BASE_URL) throw new Error("BASE_URL is not defined — check frontend/constants/api.ts");
  const url = `${BASE_URL.replace(/\/$/, "")}/api/advisory`;
  console.log("sendAdvisoryRequest -> URL:", url, "payload:", payload);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("sendAdvisoryRequest -> status:", res.status, "body:", text);

    // Try parse JSON, but fall back to raw text if parse fails
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseErr) {
      data = text;
    }

    if (!res.ok) {
      throw new Error(`Backend error ${res.status}: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (err: unknown) {
    console.error("sendAdvisoryRequest error:", err);
    const message = err && typeof err === "object" && "message" in err ? (err as any).message : String(err);

    if (message.includes("Failed to fetch")) {
      throw new Error("Network error: cannot reach backend. Check BASE_URL, backend running, and network.");
    }

    throw err;
  }
}
