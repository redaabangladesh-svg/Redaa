import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  console.log("--- next-intl Request Config ---");
  console.log("Awaited requestLocale:", locale);

  if (!locale || !routing.locales.includes(locale as any)) {
    console.log("Locale not valid or undefined, falling back to 'bn'");
    locale = routing.defaultLocale;
  }

  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    console.log("Loaded messages successfully for locale:", locale);
    return {
      locale,
      messages
    };
  } catch (error) {
    console.error("Error loading translation messages:", error);
    notFound();
  }
});
