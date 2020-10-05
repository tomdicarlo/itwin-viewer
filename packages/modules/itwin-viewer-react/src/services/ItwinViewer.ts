/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { FrontendAuthorizationClient } from "@bentley/frontend-authorization-client";
import {
  Extension,
  ExternalServerExtensionLoader,
  IModelApp,
} from "@bentley/imodeljs-frontend";
import { ErrorBoundary } from "@bentley/itwin-error-handling-react";
import { ColorTheme, UiFramework } from "@bentley/ui-framework";
import React from "react";
import ReactDOM from "react-dom";

import { AuthorizationOptions } from "../";
import IModelLoader from "../components/iModel/IModelLoader";
import AuthorizationClient from "../services/auth/AuthorizationClient";
import { ItwinViewerParams, ItwinViewerUi } from "../types";
import Initializer from "./Initializer";
import { trackEvent } from "./telemetry/TelemetryService";

export const getAuthClient = (
  authOptions: AuthorizationOptions
): FrontendAuthorizationClient => {
  if (authOptions.oidcClient) {
    return authOptions.oidcClient;
  }
  if (authOptions.getUserManagerFunction) {
    return new AuthorizationClient(authOptions.getUserManagerFunction);
  }
  //TODO localize
  throw new Error(
    "Please supply an OIDC client or a function to get your client's user manager"
  );
};

export class ItwinViewer {
  elementId: string;
  theme: ColorTheme | string | undefined;
  uiConfig: ItwinViewerUi | undefined;
  appInsightsKey: string | undefined;

  constructor(options: ItwinViewerParams) {
    if (!options.elementId) {
      //TODO localize
      throw new Error("Please supply a root elementId as the first parameter"); //TODO localize
    }
    this.elementId = options.elementId;
    this.theme = options.theme;
    this.uiConfig = options.defaultUiConfig;
    this.appInsightsKey = options.appInsightsKey;

    const authClient = getAuthClient(options.authConfig);
    Initializer.initialize(
      { authorizationClient: authClient },
      {
        appInsightsKey: options.appInsightsKey,
        backend: options.backend,
        productId: options.productId,
        imjsAppInsightsKey: options.imjsAppInsightsKey,
      }
    ).catch((error) => {
      throw error;
    });
  }

  /** load a model in the viewer once iTwinViewerApp is ready */
  load = async (contextId: string, iModelId: string, changeSetId?: string) => {
    if (this.appInsightsKey) {
      trackEvent("iTwinViewer.Viewer.Load");
    }
    // ensure iModel.js initialization completes
    await Initializer.initialized;
    // set the theme
    if (this.theme) {
      // use the provided theme
      UiFramework.setColorTheme(this.theme);
    }

    // render the viewer for the given iModel on the given element
    ReactDOM.render(
      React.createElement(
        ErrorBoundary,
        {},
        React.createElement(IModelLoader, {
          contextId: contextId,
          iModelId: iModelId,
          changeSetId: changeSetId,
          uiConfig: this.uiConfig,
          appInsightsKey: this.appInsightsKey,
        })
      ),
      document.getElementById(this.elementId)
    );
  };

  /**
   * load an extension into the viewer instance
   */
  addExtension = (
    extensionName: string,
    version?: string,
    url?: string,
    args?: string[]
  ): Promise<Extension | undefined> => {
    if (url) {
      IModelApp.extensionAdmin.addExtensionLoaderFront(
        new ExternalServerExtensionLoader(url)
      );
    }
    return IModelApp.extensionAdmin.loadExtension(extensionName, version, args);
  };
}
