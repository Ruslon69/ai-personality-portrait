import type { Locale } from '@shared/i18n/types';

export const preferenceStorageFeedback: Record<Locale, string> = {
  es: 'El cambio se aplica ahora, pero tu navegador no ha podido guardarlo para la próxima visita. Comprueba que se permite guardar datos del sitio e inténtalo de nuevo.',
  en: 'This change applies now, but your browser could not save it for your next visit. Check that site storage is allowed and try again.',
  ru: 'Изменение действует сейчас, но браузер не смог сохранить его для следующего посещения. Проверьте разрешение на хранение данных сайта и попробуйте ещё раз.',
  uk: 'Зміна діє зараз, але браузер не зміг зберегти її для наступного відвідування. Перевірте дозвіл на зберігання даних сайту й спробуйте ще раз.',
};
