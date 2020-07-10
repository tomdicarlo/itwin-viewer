// Copyright (c) Bentley Systems, Incorporated. All rights reserved.

import "./Toaster.module.scss";

import BwcToaster from "./Toaster";

// Toaster wraps ToastMaster which includes the real Toast component.

export type ToastPermanence = "persisting" | "temporary";

/**
 * View Message of the Toast Notification
 */
export declare type IToastLink = {
  /**
   *  Either the URL to be novaigated to, or the callback to be executed when clicking the <a> tag.
   */
  url: (() => void) | string;
  /**
   * Text of the <a> tag
   */
  title: string;
};

/**
 * bwc-react used to have IToastOptions exported but they converted it to type now,
 * so defining here again.
 */
export interface IToastOptions {
  duration?: number;
  hasCloseButton?: boolean;
  type?: ToastPermanence;
  link?: IToastLink;
}
class ThemedToaster {
  private _toaster: BwcToaster;

  public constructor() {
    this._toaster = new BwcToaster();
  }
  error(localizedText: string, settings?: IToastOptions) {
    this._toaster.error(localizedText, settings);
  }
  success(localizedText: string, settings?: IToastOptions) {
    this._toaster.success(localizedText, settings);
  }
  info(localizedText: string, settings?: IToastOptions) {
    this._toaster.informational(localizedText, settings);
  }
  closeAll() {
    this._toaster.closeAll();
  }
}

export const Toaster = new ThemedToaster();