import { useEffect, useState } from 'react';

export default function <T = string>(
	key: string
): [T | null | undefined, (value: T | null) => void] {
	const [state, setState] = useState<T | null | undefined>(undefined);

	useEffect(() => {
		const ls = window.localStorage.getItem(key);
		if (ls === null) setState(null);
		else setState(JSON.parse(ls));
	}, []);

	function setLocalStorage(value: T | null): void {
		setState(value);
		if (value === null) window.localStorage.removeItem(key);
		else window.localStorage.setItem(key, JSON.stringify(value));
	}

	return [state, setLocalStorage];
}
