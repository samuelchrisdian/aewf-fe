/**
 * Extract data from API response
 * Handles both wrapped responses ({ success, data, ... }) and direct data
 */
export function extractData<T>(response: any): T {
  // If response has data property, extract it
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }
  // Otherwise return response as-is
  return response as T;
}

/**
 * Extract paginated data from API response
 * Transforms API pagination format to frontend format
 */
export function extractPaginatedData<T>(response: any) {
  const data = extractData(response);
  const pagination = response.pagination || {};

  return {
    items: Array.isArray(data) ? data : [],
    total: pagination.total || 0,
    page: pagination.page || 1,
    per_page: pagination.per_page || 20,
    total_pages: pagination.pages || 1,
  };
}

