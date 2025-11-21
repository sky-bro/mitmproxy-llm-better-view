// Base renderer abstract class
import { APIRenderer } from '../api/types';
import { getFlowData } from '../../utils/cache';
import { createReactContainer, createDirectElement } from '../../utils/dom';
import { createRoot } from 'react-dom/client';
import React from 'react';

export abstract class BaseRenderer implements APIRenderer {
  abstract name: string;

  /**
   * Render the content for the given flow
   * @param uuid Flow UUID
   * @param action Request or Response
   * @param viewerName Viewer type (json, raw, etc.)
   */
  abstract render(uuid: string, action: 'request' | 'response', viewerName?: string): Promise<void>;

  /**
   * Helper method to render React component to DOM
   * @param component React component to render
   * @param props Component props
   */
  protected async renderReactComponent(
    component: React.ComponentType<any>,
    props: any
  ): Promise<void> {
    const container = createReactContainer();
    const root = createRoot(container);

    // Create a promise that resolves when React rendering is complete
    await new Promise<void>((resolve) => {
      root.render(
        <React.StrictMode>
          {React.createElement(component, props)}
        </React.StrictMode>
      );

      // Force a React update to ensure rendering is complete
      setTimeout(() => {
        resolve();
      }, 0);
    });

    createDirectElement(container.innerHTML);
  }

  /**
   * Helper method to fetch flow data
   * @param uuid Flow UUID
   * @param action Request or Response
   * @param viewerName Viewer type
   */
  protected async fetchFlowData(
    uuid: string,
    action: 'request' | 'response',
    viewerName: string = "Auto"
  ): Promise<any> {
    return await getFlowData(`http://${window.location.host}/flows/${uuid}/${action}/content/${viewerName}.json`);
  }

  /**
   * Helper method to parse JSON content
   * @param content JSON string content
   */
  protected parseJSON(content: string): any {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to parse JSON content:`, error);
      throw error;
    }
  }
}