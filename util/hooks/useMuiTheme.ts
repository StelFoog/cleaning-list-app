import { createTheme, Theme } from '@mui/material';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

// Can't apply our theme directly to MUI textfields so this allows our theme to be used by them
// Should be removed once we have our own textfield component
export default function useMuiTheme(): Theme {
	const { theme } = useTheme();
	const muiTheme = useMemo(
		() =>
			createTheme({
				palette: { mode: (theme as 'light' | 'dark' | undefined) || 'light' },
			}),
		[theme]
	);

	return muiTheme;
}
