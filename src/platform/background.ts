import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

type BackgroundSource = {
  isHidden: () => boolean;
  listenVisibility: (listener: () => void) => () => void;
  listenNative?: (listener: (state: { isActive: boolean }) => void) => Promise<{ remove: () => Promise<void> }>;
};

/** Cancel sessions on browser hiding or Android backgrounding; never auto-resume. */
export function onAppBackground(callback: () => void, source: BackgroundSource = {
  isHidden: () => document.hidden,
  listenVisibility: listener => {
    document.addEventListener('visibilitychange', listener);
    return () => document.removeEventListener('visibilitychange', listener);
  },
  listenNative: Capacitor.isNativePlatform()
    ? listener => App.addListener('appStateChange', listener)
    : undefined,
}): () => void {
  let disposed = false;
  let removeNative: (() => Promise<void>) | undefined;
  const notify = () => { if (!disposed) callback(); };
  const removeVisibility = source.listenVisibility(() => { if (source.isHidden()) notify(); });
  if (source.listenNative) {
    void source.listenNative(state => { if (!state.isActive) notify(); }).then(handle => {
      if (disposed) void handle.remove();
      else removeNative = () => handle.remove();
    }).catch(error => {
      // Browser visibility cleanup remains available if the native bridge fails.
      console.warn('Could not subscribe to native app lifecycle.', error);
    });
  }
  return () => {
    disposed = true;
    removeVisibility();
    void removeNative?.();
  };
}
