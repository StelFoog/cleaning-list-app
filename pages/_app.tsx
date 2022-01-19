// Global imports
import '@fontsource/open-sans';
import '../styles/globals.css';
// Local imports
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';

function App({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider storageKey="cleaning::theme" enableSystem={false}>
			<Component {...pageProps} />
			<footer>
				<div className="container">
					<span>© Samuel H.E. Larsson 2022</span>
					<span>IN-Sektionen</span>
				</div>
			</footer>
		</ThemeProvider>
	);
}

export default App;
