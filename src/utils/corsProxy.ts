/**
 * Client-side CORS proxy utility
 * Uses public CORS proxies to bypass CORS restrictions
 */

// List of public CORS proxies
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];

/**
 * Adds a CORS proxy to a URL
 * @param url The URL to proxy
 * @returns The proxied URL
 */
export function addCorsProxy(url: string): string {
  // Use the first proxy in the list
  return `${CORS_PROXIES[0]}${encodeURIComponent(url)}`;
}

/**
 * Fetches data through a CORS proxy
 * @param url The URL to fetch
 * @returns The response data
 */
export async function fetchWithCorsProxy(url: string): Promise<Response> {
  // Try each proxy in order until one works
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxy = CORS_PROXIES[i];
    const proxyUrl = proxy.includes('?url=') 
      ? `${proxy}${encodeURIComponent(url)}`
      : `${proxy}${url}`;
    
    try {
      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.warn(`Proxy ${proxy} failed:`, error);
      // Continue to the next proxy
    }
  }
  
  // If all proxies fail, throw an error
  throw new Error('All CORS proxies failed');
}
