// Detector Registry (optional - could be merged with main API registry)
import { APIDetector } from '../api/types';

export class DetectorRegistry {
  private detectors: Map<string, APIDetector> = new Map();

  register(detector: APIDetector): void {
    this.detectors.set(detector.name, detector);
  }

  get(name: string): APIDetector | undefined {
    return this.detectors.get(name);
  }

  getAll(): APIDetector[] {
    return Array.from(this.detectors.values());
  }

  detect(flow: any): APIDetector | undefined {
    for (const detector of this.detectors.values()) {
      if (detector.detect(flow)) {
        return detector;
      }
    }
    return undefined;
  }
}

// Global detector registry instance
export const detectorRegistry = new DetectorRegistry();