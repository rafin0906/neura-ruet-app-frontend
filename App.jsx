import React, { useEffect } from 'react';
import BootSplash from 'react-native-bootsplash';
import StackNavigator from './src/components/navigation/StackNavigator';

export default function App() {
  useEffect(() => {
    const init = async () => {
      // Place any startup tasks here (e.g., preload, restore auth state, etc.)
    };

    init().finally(async () => {
      try {
        await new Promise((resolve) => {
          if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(() => resolve());
            return;
          }

          // Fallbacks for environments without requestIdleCallback
          if (typeof setImmediate === 'function') {
            setImmediate(resolve);
          } else {
            setTimeout(resolve, 0);
          }
        });
      } catch (e) {
        // ignore
      }

      try {
        if (BootSplash.isVisible()) {
          await BootSplash.hide({ fade: true });
        }
      } catch (e) {
        // ignore
      }
    });
  }, []);

  return (
    <StackNavigator />
  );
}