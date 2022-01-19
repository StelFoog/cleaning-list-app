import { NextPage } from 'next';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import LabeledCheck from '../components/LabeledCheck';
import useAuth from '../util/hooks/useAuth';
import useMounted from '../util/hooks/useMounted';

const Settings: NextPage = () => {
	const router = useRouter();
	const [_auth, newAuth] = useAuth();
	const { theme, setTheme } = useTheme();

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
			<button onClick={deauthenticate}>Remove authentication</button>
			<LabeledCheck
				label="Use dark mode"
				value={theme === 'dark'}
				onChange={changeTheme}
				color="#5f27cd"
				labelColor="var(--foreground)"
				changeLabelChecked={false}
			/>
		</main>
	);
};

export default Settings;
