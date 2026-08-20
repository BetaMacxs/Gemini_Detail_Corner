import md5 from "https://esm.sh/js-md5@0.8.3";

/**
 * PayFast uses PHP urlencode() standard:
 * - Spaces are converted to '+'
 * - All other non-alphanumeric characters except - _ . are percent-encoded with uppercase hex
 */
export function payfastUrlEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/%20/g, "+")
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A")
    .replace(/~/g, "%7E");
}

export interface PayfastParamPair {
  key: string;
  val: string;
}

/**
 * Generates PayFast MD5 signature from a record or ordered parameter array
 */
export function generatePayfastSignature(
  data: Record<string, string> | PayfastParamPair[],
  passPhrase?: string | null
): string {
  let paramString = "";

  if (Array.isArray(data)) {
    for (const item of data) {
      if (item.key !== "signature" && item.val !== undefined && item.val !== null && item.val !== "") {
        paramString += `${item.key}=${payfastUrlEncode(item.val.trim())}&`;
      }
    }
  } else {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const val = data[key];
        if (key !== "signature" && val !== undefined && val !== null && val !== "") {
          paramString += `${key}=${payfastUrlEncode(val.trim())}&`;
        }
      }
    }
  }

  paramString = paramString.slice(0, -1);

  if (passPhrase && passPhrase.trim() !== "") {
    paramString += `&passphrase=${payfastUrlEncode(passPhrase.trim())}`;
  }

  return md5(paramString);
}

/**
 * Parses raw application/x-www-form-urlencoded body while maintaining exact parameter arrival order
 */
export function parsePayfastBody(rawBody: string): {
  data: Record<string, string>;
  orderedPairs: PayfastParamPair[];
  signature: string;
  rawStringWithoutSignature: string;
} {
  const cleanBody = rawBody.trim();
  const pairs = cleanBody.split("&");
  const data: Record<string, string> = {};
  const orderedPairs: PayfastParamPair[] = [];
  let signature = "";

  for (const pair of pairs) {
    if (!pair) continue;
    const eqIdx = pair.indexOf("=");
    let key = "";
    let rawVal = "";

    if (eqIdx >= 0) {
      key = decodeURIComponent(pair.substring(0, eqIdx).replace(/\+/g, " "));
      rawVal = decodeURIComponent(pair.substring(eqIdx + 1).replace(/\+/g, " "));
    } else {
      key = decodeURIComponent(pair.replace(/\+/g, " "));
      rawVal = "";
    }

    if (key === "signature") {
      signature = rawVal;
    } else {
      data[key] = rawVal;
      orderedPairs.push({ key, val: rawVal });
    }
  }

  // Remove signature parameter from raw string if present
  let rawStringWithoutSignature = cleanBody
    .replace(/(^|&)signature=[^&]*(&|$)/, "$1")
    .replace(/^&+|&+$/g, "");

  return { data, orderedPairs, signature, rawStringWithoutSignature };
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

