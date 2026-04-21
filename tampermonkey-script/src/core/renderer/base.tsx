// Base renderer abstract class
import { APIRenderer } from '../api/types';
import { getFlowData } from '../../utils/cache';
import { getOrCreateRenderTarget } from '../../utils/dom';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';

let sharedRoot: Root | null = null;
let sharedRootMount: HTMLElement | null = null;

export abstract class BaseRenderer implements APIRenderer {
  abstract name: string;

  abstract render(uuid: string, action: 'request' | 'response', viewerName?: string): Promise<void>;

  protected async renderReactComponent(
    component: React.ComponentType<any>,
    props: any
  ): Promise<void> {
    let mount: HTMLElement;
    try {
      mount = getOrCreateRenderTarget();
    } catch (e) {
      console.warn(e);
      return;
    }

    if (!sharedRoot || sharedRootMount !== mount) {
      if (sharedRoot) sharedRoot.unmount();
      sharedRoot = createRoot(mount);
      sharedRootMount = mount;
    }

    await new Promise<void>((resolve) => {
      sharedRoot!.render(
        <React.StrictMode>
          {React.createElement(component, props)}
        </React.StrictMode>
      );
      setTimeout(() => resolve(), 0);
    });
  }

  protected async fetchFlowData(
    uuid: string,
    action: 'request' | 'response',
    viewerName: string = "Auto"
  ): Promise<any> {
    return await getFlowData(`http://${window.location.host}/flows/${uuid}/${action}/content/${viewerName}.json`);
  }

  protected parseJSON(content: string): any {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to parse JSON content:`, error);
      throw error;
    }
  }
}
