import { get } from 'lodash';

export type Localization = {
	(key: string): string;
	instance: (key: string) => Localization;
	object: object;
};

/**
 * creates a `l10n` instace for a given translations object
 * @param translations translations object
 * @returns `l10n` function that returns the localization string for a given key if there is one, otherwise it returns the key
 */
export default function localize(translations: object): Localization {
	/**
	 * gets the translation
	 * @param key the key for the translation
	 * @returns the translation corresponding to the key, if there's no translation for that key it
	 * returns the `key`
	 */
	function l10n(key: string): string {
		const val = get(translations, key);
		if (typeof val === 'string' || val === null) return val;
		else return key;
	}

	/**
	 * creates a new translations object based on the current one
	 * @param key the key for the new translations object
	 * @returns a new `l10n` instance based on the translations object specified by the key or an
	 * empty object if no object could be found for that key
	 */
	l10n.instance = (key: string) => {
		const newTranslations = get(translations, key);
		if (typeof newTranslations === 'object') return localize(newTranslations);
		else return localize({});
	};

	l10n.object = translations;

	return l10n;
}
