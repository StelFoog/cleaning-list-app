import { GetStaticProps, NextPage } from 'next';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import LabeledCheck from '../components/LabeledCheck';
import { Translations } from '../types/Translations';
import { getTranslations } from '../util/getLocalizations';
import useAuth from '../util/hooks/useAuth';
import localize from '../util/localize';

const Settings: NextPage<Translations> = ({ translations }) => {
	const router = useRouter();
	const [_auth, newAuth] = useAuth();
	const { theme, setTheme } = useTheme();

	const l10n = localize(translations);

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
			<button onClick={deauthenticate}>{l10n('pages.settings.remove-authentication')}</button>
			<LabeledCheck
				label={l10n('pages.settings.dark-mode')}
				value={theme === 'dark'}
				onChange={changeTheme}
				color="#5f27cd"
				labelColor="var(--foreground)"
				changeLabelChecked={false}
			/>
		</main>
	);
};

export const getStaticProps: GetStaticProps<Translations> = async ({ locale }) => {
	const translations = getTranslations(locale as string, ['pages.settings']);

	return {
		props: { translations },
	};
};

export default Settings;
