// Base detector abstract class
import { APIDetector, Flow } from '../api/types';

export abstract class BaseDetector implements APIDetector {
  abstract name: string;

  /**
   * Check if the flow matches this API provider
   * @param flow The flow to check
   */
  abstract detect(flow: Flow): boolean;

  /**
   * Helper method to check if path contains specific patterns
   * @param flow The flow to check
   * @param patterns Array of path patterns to match
   */
  protected matchesPath(flow: Flow, patterns: string[]): boolean {
    const path = flow.request.path.toLowerCase();
    return patterns.some(pattern => path.includes(pattern));
  }

  /**
   * Helper method to check if host contains specific patterns
   * @param flow The flow to check
   * @param patterns Array of host patterns to match
   */
  protected matchesHost(flow: Flow, patterns: string[]): boolean {
    // Extract host from headers if available
    const headers = flow.request.headers || [];
    for (const header of headers) {
      if (Array.isArray(header) && header[0]?.toLowerCase() === 'host') {
        const host = header[1]?.toLowerCase();
        return patterns.some(pattern => host?.includes(pattern));
      }
      if (typeof header === 'object' && header !== null) {
        for (const [key, value] of Object.entries(header)) {
          if (key.toLowerCase() === 'host') {
            const host = String(value).toLowerCase();
            return patterns.some(pattern => host.includes(pattern));
          }
        }
      }
    }
    return false;
  }
}