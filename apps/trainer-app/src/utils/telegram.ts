export function initTelegramApp() {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.MainButton.setParams({
      text: "Готово",
      is_visible: false
    });
    return tg;
  }
  return null;
}

export function showMainButton(text: string, onClick: () => void) {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.MainButton.setParams({
      text,
      is_visible: true
    });
    tg.MainButton.onClick(onClick);
  }
}

export function hideMainButton() {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.MainButton.hide();
  }
}

export function hapticFeedback(type: "light" | "medium" | "heavy" = "light") {
  if (typeof window !== "undefined" && window.Telegram?.WebApp?.HapticFeedback) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          setParams: (params: {
            text?: string;
            is_visible?: boolean;
            is_active?: boolean;
          }) => void;
          onClick: (callback: () => void) => void;
          hide: () => void;
          show: () => void;
        };
        HapticFeedback: {
          impactOccurred: (type: "light" | "medium" | "heavy") => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
      };
    };
  }
}
