import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { Capacitor } from '@capacitor/core';

export const applyDynamicSystemBars = async (themeHexColor: string) => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    let hex = themeHexColor.trim();
    if (hex.startsWith('#') && hex.length === 4) {
      hex = '#' + hex[1]+hex[1] + hex[2]+hex[2] + hex[3]+hex[3];
    }

    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    
    const isLightBackground = luminance > 186; 

    // STRICT CAMOUFLAGE LOGIC:
    // Capacitor Style.Light = White icons/text
    // Capacitor Style.Dark = Black icons/text
    
    // If background is Light -> Use Style.Light (White icons on Light bg -> Invisible)
    // If background is Dark -> Use Style.Dark (Black icons on Dark bg -> Invisible)
    const camouflageStyle = isLightBackground ? Style.Light : Style.Dark;
    
    // For Navigation Bar Buttons:
    // If background is Light -> darkButtons: false (White buttons on Light bg)
    // If background is Dark -> darkButtons: true (Black buttons on Dark bg)
    const camouflageNavButtons = isLightBackground ? false : true;

    // تطبيق لون الخلفية بدقة لشريط الحالة العُلوي
    await StatusBar.setBackgroundColor({ color: hex });
    await StatusBar.setStyle({ style: camouflageStyle });

    // تطبيق لون الخلفية بدقة لشريط التنقل السُفلي والتأكد من إخفاء الأزرار
    await NavigationBar.setColor({ 
      color: hex, 
      darkButtons: camouflageNavButtons 
    });

  } catch (err) {
    console.log("System bars sync failed", err);
  }
};
