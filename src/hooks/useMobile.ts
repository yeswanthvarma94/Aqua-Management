import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Network } from '@capacitor/network';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';

export function useMobile() {
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const isMobile = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  useEffect(() => {
    // Network status monitoring
    const setupNetwork = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);

      Network.addListener('networkStatusChange', (status) => {
        setIsOnline(status.connected);
      });
    };

    // Keyboard monitoring
    const setupKeyboard = () => {
      if (isMobile) {
        Keyboard.addListener('keyboardWillShow', (info) => {
          setKeyboardHeight(info.keyboardHeight);
          setIsKeyboardOpen(true);
        });

        Keyboard.addListener('keyboardWillHide', () => {
          setKeyboardHeight(0);
          setIsKeyboardOpen(false);
        });
      }
    };

    // Status bar configuration
    const setupStatusBar = async () => {
      if (isMobile) {
        try {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#3B82F6' });
        } catch (error) {
          console.log('StatusBar not available:', error);
        }
      }
    };

    setupNetwork();
    setupKeyboard();
    setupStatusBar();

    // Battery level (mock for now, would need a plugin)
    setBatteryLevel(0.85);

    return () => {
      Network.removeAllListeners();
      if (isMobile) {
        Keyboard.removeAllListeners();
      }
    };
  }, [isMobile]);

  const hapticFeedback = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!isMobile) return;

    try {
      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      }[style];

      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  const vibrate = async (duration: number = 100) => {
    if (!isMobile) return;

    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.log('Vibration not available:', error);
    }
  };

  return {
    isMobile,
    platform,
    isOnline,
    batteryLevel,
    keyboardHeight,
    isKeyboardOpen,
    hapticFeedback,
    vibrate,
  };
}