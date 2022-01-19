import { useEffect, useState } from 'react';

// Returns true when component has rendered on client side and false before that
export default function useMounted(): boolean {
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	return mounted;
}
