import { useTheme } from 'next-themes';
import { ToastContainer } from 'react-toastify';

// Since this component is rendered inside ThemeProvider in pages/_app.tsx we can access our theme and apply it to our toast here
export default function ToastAlert(): JSX.Element {
	const { theme } = useTheme();

	return (
		<ToastContainer
			position="bottom-right"
			autoClose={5000}
			newestOnTop
			pauseOnFocusLoss
			closeOnClick={false}
			draggable
			pauseOnHover
			theme={theme === 'dark' ? 'dark' : 'light'}
			style={{ fontSize: '0.8rem' }}
		/>
	);
}
