/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	i18n: {
		// Re-add locales when localizations are fully supported
		// locales: ['sv', 'en'],
		locales: ['sv'],
		defaultLocale: 'sv',
		localeDetection: false,
	},
};
