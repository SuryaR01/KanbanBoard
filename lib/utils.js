export const safeParseJSON = (data, fallback = []) => {
  if (Array.isArray(data) || (typeof data === 'object' && data !== null)) {
    return data;
  }
  if (!data || typeof data !== 'string') return fallback;
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : (parsed || fallback);
  } catch (e) {
    console.error("JSON Parse Error:", e, "Data:", data);
    return fallback;
  }
};
