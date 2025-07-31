/**
 * Утилиты для управления уведомлениями и их персистентностью
 */

const SHOWN_NOTIFICATIONS_KEY = 'shown-notifications';
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 часа

/**
 * Получить список показанных уведомлений
 */
export const getShownNotifications = (): Set<string> => {
  try {
    const stored = localStorage.getItem(SHOWN_NOTIFICATIONS_KEY);
    if (!stored) return new Set();
    
    const data = JSON.parse(stored);
    if (Array.isArray(data)) {
      return new Set(data);
    }
    
    // Если данные в старом формате (объект с timestamp), очищаем
    localStorage.removeItem(SHOWN_NOTIFICATIONS_KEY);
    return new Set();
  } catch {
    // Если ошибка парсинга, очищаем
    localStorage.removeItem(SHOWN_NOTIFICATIONS_KEY);
    return new Set();
  }
};

/**
 * Добавить уведомление в список показанных
 */
export const markNotificationAsShown = (notificationId: string): void => {
  try {
    const shown = getShownNotifications();
    shown.add(notificationId);
    localStorage.setItem(SHOWN_NOTIFICATIONS_KEY, JSON.stringify(Array.from(shown)));
  } catch (error) {
    console.warn('Failed to save shown notification:', error);
  }
};

/**
 * Очистить старые записи о показанных уведомлениях
 * Вызывается автоматически при загрузке приложения
 */
export const cleanupShownNotifications = (): void => {
  try {
    const lastCleanup = localStorage.getItem('notifications-last-cleanup');
    const now = Date.now();
    
    // Очищаем раз в сутки
    if (lastCleanup && (now - parseInt(lastCleanup)) < CLEANUP_INTERVAL) {
      return;
    }
    
    // Очищаем все записи старше недели
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    // Для простоты просто очищаем всё, если прошло больше недели с последней очистки
    if (!lastCleanup || (now - parseInt(lastCleanup)) > (7 * 24 * 60 * 60 * 1000)) {
      localStorage.removeItem(SHOWN_NOTIFICATIONS_KEY);
      console.log('Cleaned up old shown notifications');
    }
    
    localStorage.setItem('notifications-last-cleanup', now.toString());
  } catch (error) {
    console.warn('Failed to cleanup shown notifications:', error);
  }
};

/**
 * Проверить, было ли уведомление уже показано
 */
export const wasNotificationShown = (notificationId: string): boolean => {
  const shown = getShownNotifications();
  return shown.has(notificationId);
};

/**
 * Очистить все записи о показанных уведомлениях (для отладки)
 */
export const clearAllShownNotifications = (): void => {
  localStorage.removeItem(SHOWN_NOTIFICATIONS_KEY);
  localStorage.removeItem('notifications-last-cleanup');
  console.log('Cleared all shown notifications');
};