import { readFileSync } from 'fs';
import { get, set } from 'lodash';
import path from 'path';

/**
 * Builds a translations object for a given locale by including only the requested keys from the
 * full translation file to limit bundle size
 * @param locale the locale to get the translations for
 * @param keys the requested keys
 * @returns a translation object with only the requested contents
 */
export function getTranslations(locale: string, keys: string[]): object {
	const translations = {};
	// gets the full localiation object
	const localization = JSON.parse(
		readFileSync(path.join(process.cwd(), 'localization', `${locale}.json`)).toString()
	);

	// goes through all the keys and tries to get them from the localization file and set them in the translations object
	keys.forEach((key) => {
		const val = get(localization, key);
		if (val) set(translations, key, val);
	});

	return translations;
}
