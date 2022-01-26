import { GetStaticProps, NextPage } from 'next';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LabeledCheck from '../components/LabeledCheck';
import { Translations } from '../types/Translations';
import { getTranslations } from '../util/getLocalizations';
import useAuth from '../util/hooks/useAuth';
import localize from '../util/localize';

interface Props extends Translations {
	locale: string;
}

const Settings: NextPage<Props> = ({ translations, locale }) => {
	const router = useRouter();
	const [_auth, newAuth] = useAuth();
	const { theme, setTheme } = useTheme();

	const pageInstance = localize(translations).instance('pages.settings');

	function deauthenticate() {
		newAuth(null);
		router.push('/');
	}

	function changeTheme(newTheme: boolean): void {
		if (newTheme) setTheme('dark');
		else setTheme('light');
	}

	return (
		<main>
			<h1>{pageInstance('title')}</h1>
			<button onClick={deauthenticate}>{pageInstance('remove-authentication')}</button>
			<div className="contentSplit" />
			<Link href="/" locale={locale === 'sv' ? 'en' : 'sv'} passHref>
				<button>{pageInstance('translate')}</button>
			</Link>
			<div className="contentSplit" />
			<LabeledCheck
				label={pageInstance('dark-mode')}
				value={theme === 'dark'}
				onChange={changeTheme}
				color="#5f27cd"
				labelColor="var(--foreground)"
				changeLabelChecked={false}
			/>
		</main>
	);
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => {
	const translations = getTranslations(locale as string, ['pages.settings']);

	return {
		props: { translations, locale: locale || 'sv' },
	};
};

export default Settings;
