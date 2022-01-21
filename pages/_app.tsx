// Global imports
import '@fontsource/open-sans';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import '../styles/nprogress.css';
// Local imports
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import NProgress from 'nprogress';
import ToastAlert from '../components/ToastAlert';
import { SWRConfig } from 'swr';
import { ResData } from '../types/db';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import useAuth from '../util/hooks/useAuth';
import { useEffect } from 'react';

function App({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const [_, setAuth] = useAuth();

	useEffect(() => {
		router.events.on('routeChangeStart', NProgress.start);
		router.events.on('routeChangeError', NProgress.done);
		router.events.on('routeChangeComplete', NProgress.done);

		return () => {
			router.events.off('routeChangeStart', NProgress.start);
			router.events.off('routeChangeError', NProgress.done);
			router.events.off('routeChangeComplete', NProgress.done);
		};
	}, [router]);

	return (
		<ThemeProvider storageKey="cleaning::theme" enableSystem={false}>
			<SWRConfig
				value={{
					onError: (error: Error) => {
						if ((error as ResData).deauthenticated) {
							toast.warn('You have to be authenticated to access this page');
							setAuth(null); // in case they had an old auth key
							router.push(`/?back=${router.asPath}`);
						} else toast.error(error.message);
					},
				}}
			>
				<Component {...pageProps} />
				<ToastAlert />
				<footer>
					<div className="container">
						<span>© Samuel H.E. Larsson 2022</span>
						<span>IN-Sektionen</span>
					</div>
				</footer>
			</SWRConfig>
		</ThemeProvider>
	);
}

export default App;
