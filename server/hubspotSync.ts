/**
 * HubSpot CRM Sync Service
 * Handles real-time contact creation/update when a new lead subscribes via the site.
 * Uses HubSpot REST API v3 with a Private App Access Token.
 */
import { ENV } from "./_core/env";

const HUBSPOT_API_BASE = "https://api.hubapi.com";

interface HubSpotContactProperties {
  email: string;
  firstname?: string;
  lastname?: string;
  canal_aquisicao?: string;
  emc_utm_source?: string;
  emc_utm_medium?: string;
  emc_utm_campaign?: string;
  emc_utm_content?: string;
  emc_utm_term?: string;
  emc_landing_page?: string;
  emc_first_touch_url?: string;
}

interface LeadData {
  email: string;
  name?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  referrer?: string | null;
  landingPage?: string | null;
}

/**
 * Determine the "Canal de Aquisição" based on UTM tracking data.
 * Maps UTM source/medium combinations to HubSpot enum values.
 */
function determineCanalAquisicao(utmSource?: string | null, utmMedium?: string | null): string {
  if (!utmSource) return "site_institucional";

  const source = utmSource.toLowerCase();
  const medium = (utmMedium || "").toLowerCase();

  if (source.includes("google") && medium === "cpc") return "google_ads";
  if (source.includes("google") && (medium === "organic" || medium === "")) return "google_organico";
  if (source.includes("instagram")) return "instagram";
  if (source.includes("youtube")) return "youtube";
  if (source.includes("whatsapp")) return "whatsapp_organico";
  if (source === "site" || source === "site_institucional") return "site_institucional";
  if (source.includes("indicacao") || source.includes("referral")) return "indicacao";
  if (source.includes("evento") || source.includes("event")) return "evento";

  return "site_institucional";
}

/**
 * Split a full name into firstname and lastname.
 */
function splitName(name?: string | null): { firstname: string; lastname: string } {
  if (!name || name.trim() === "") return { firstname: "", lastname: "" };
  const parts = name.trim().split(/\s+/);
  const firstname = parts[0] || "";
  const lastname = parts.slice(1).join(" ") || "";
  return { firstname, lastname };
}

/**
 * Make an authenticated request to HubSpot API.
 */
async function hubspotFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = ENV.hubspotAccessToken;
  if (!token) {
    throw new Error("HUBSPOT_ACCESS_TOKEN is not configured");
  }

  return fetch(`${HUBSPOT_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

/**
 * Search for an existing contact by email in HubSpot.
 * Returns the contact ID if found, null otherwise.
 */
async function findContactByEmail(email: string): Promise<string | null> {
  try {
    const response = await hubspotFetch("/crm/v3/objects/contacts/search", {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: email,
              },
            ],
          },
        ],
        properties: ["email"],
        limit: 1,
      }),
    });

    if (!response.ok) {
      console.error("[HubSpot] Search failed:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].id;
    }
    return null;
  } catch (error) {
    console.error("[HubSpot] Search error:", error);
    return null;
  }
}

/**
 * Create a new contact in HubSpot.
 * Returns the new contact ID.
 */
async function createContact(properties: HubSpotContactProperties): Promise<string | null> {
  try {
    const response = await hubspotFetch("/crm/v3/objects/contacts", {
      method: "POST",
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // If contact already exists (409 conflict), try to extract the existing ID
      if (response.status === 409) {
        console.warn("[HubSpot] Contact already exists, will try to update instead");
        return null;
      }
      console.error("[HubSpot] Create failed:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.id || null;
  } catch (error) {
    console.error("[HubSpot] Create error:", error);
    return null;
  }
}

/**
 * Update an existing contact in HubSpot.
 * Returns true on success.
 */
async function updateContact(contactId: string, properties: Partial<HubSpotContactProperties>): Promise<boolean> {
  try {
    const response = await hubspotFetch(`/crm/v3/objects/contacts/${contactId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) {
      console.error("[HubSpot] Update failed:", response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[HubSpot] Update error:", error);
    return false;
  }
}

/**
 * Sync a single lead to HubSpot in real-time.
 * Creates a new contact or updates an existing one.
 * Returns the HubSpot contact ID on success, null on failure.
 */
export async function syncLeadToHubSpot(lead: LeadData): Promise<string | null> {
  if (!ENV.hubspotAccessToken) {
    console.warn("[HubSpot] Sync skipped: HUBSPOT_ACCESS_TOKEN not configured");
    return null;
  }

  const { firstname, lastname } = splitName(lead.name);
  const canalAquisicao = determineCanalAquisicao(lead.utmSource, lead.utmMedium);

  const properties: HubSpotContactProperties = {
    email: lead.email,
    firstname: firstname || undefined,
    lastname: lastname || undefined,
    canal_aquisicao: canalAquisicao,
    emc_utm_source: lead.utmSource || undefined,
    emc_utm_medium: lead.utmMedium || undefined,
    emc_utm_campaign: lead.utmCampaign || undefined,
    emc_utm_content: lead.utmContent || undefined,
    emc_utm_term: lead.utmTerm || undefined,
    emc_landing_page: lead.landingPage || undefined,
    emc_first_touch_url: lead.referrer || undefined,
  };

  // Remove undefined values
  const cleanProperties = Object.fromEntries(
    Object.entries(properties).filter(([_, v]) => v !== undefined)
  ) as HubSpotContactProperties;

  try {
    // Check if contact already exists
    const existingId = await findContactByEmail(lead.email);

    if (existingId) {
      // Update existing contact
      const { email, ...updateProps } = cleanProperties;
      const success = await updateContact(existingId, updateProps);
      if (success) {
        console.log(`[HubSpot] Updated contact ${existingId} for ${lead.email}`);
        return existingId;
      }
      return null;
    }

    // Create new contact
    const newId = await createContact(cleanProperties);
    if (newId) {
      console.log(`[HubSpot] Created contact ${newId} for ${lead.email}`);
      return newId;
    }

    // If create returned null (possibly 409), try to find and update
    const retryId = await findContactByEmail(lead.email);
    if (retryId) {
      const { email, ...updateProps } = cleanProperties;
      await updateContact(retryId, updateProps);
      console.log(`[HubSpot] Updated contact ${retryId} for ${lead.email} (after create conflict)`);
      return retryId;
    }

    return null;
  } catch (error) {
    console.error(`[HubSpot] Sync failed for ${lead.email}:`, error);
    return null;
  }
}

/**
 * Validate the HubSpot access token by making a lightweight API call.
 * Returns true if the token is valid.
 */
export async function validateHubSpotToken(): Promise<boolean> {
  try {
    const response = await hubspotFetch("/crm/v3/objects/contacts?limit=1");
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Validate that the HubSpot token has write permission.
 * Creates a test contact, then immediately deletes it.
 * Returns true if the token can create contacts.
 */
export async function validateHubSpotWritePermission(): Promise<boolean> {
  const testEmail = `manus-test-${Date.now()}@gmail.com`;
  try {
    // Try to create a test contact
    const createResponse = await hubspotFetch("/crm/v3/objects/contacts", {
      method: "POST",
      body: JSON.stringify({
        properties: {
          email: testEmail,
          firstname: "EMC_Test",
          lastname: "Validation",
        },
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("[HubSpot] Write permission test failed:", createResponse.status, errorText);
      return false;
    }

    const data = await createResponse.json();
    const contactId = data.id;

    // Clean up: delete the test contact
    if (contactId) {
      await hubspotFetch(`/crm/v3/objects/contacts/${contactId}`, {
        method: "DELETE",
      });
      console.log(`[HubSpot] Write permission validated. Test contact ${contactId} created and deleted.`);
    }

    return true;
  } catch (error) {
    console.error("[HubSpot] Write permission validation error:", error);
    return false;
  }
}
