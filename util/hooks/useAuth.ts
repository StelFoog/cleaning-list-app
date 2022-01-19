import axios from 'axios';
import { useEffect, useState } from 'react';
import useLocalState from './useLocalState';

const AUTH = 'cleaning::auth';
const VERIFIED = 'cleaning::verified';

export type NewAuth = (authKey: string | null) => Promise<boolean>;

// null means data is being fetched (either from localstorage or api), false means not authenticated, otherwise it has an authenticated key
// TODO: Only check authentication when last verification was more than a day ago
export default function useAuth(): [string | false | null, NewAuth] {
	const [auth, setAuth] = useLocalState<string>(AUTH);
	const [lastVerified, setLastVerified] = useLocalState<Date>(VERIFIED);
	const [gettingData, setGettingData] = useState(false);

	useEffect(() => {
		if (typeof auth === 'string') {
			setGettingData(true);
			axios
				.get<{ success: boolean; error?: string }>('/api/login', {
					headers: { authorization: auth },
				})
				.then(({ data }) => {
					if (data.success) setLastVerified(new Date());
					else setLastVerified(null);
				})
				.catch((e) => {
					console.error(e);
					setLastVerified(null);
				})
				.finally(() => {
					setGettingData(false);
				});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function newAuthKey(authKey: string | null): Promise<boolean> {
		if (authKey === null) {
			setLastVerified(null);
			setAuth(null);
			return new Promise((resolve) => {
				resolve(false);
			});
		}
		setGettingData(true);
		setLastVerified(null);
		return axios
			.get<{ success: boolean; error?: string }>('/api/login', {
				headers: { authorization: authKey },
			})
			.then(({ data }) => {
				if (data.success) {
					setAuth(authKey);
					setLastVerified(new Date());
					return true;
				}
				return false;
			})
			.catch((e) => {
				console.error(e);
				return false;
			})
			.finally(() => {
				setGettingData(false);
			});
	}

	if (auth === undefined || gettingData) return [null, newAuthKey];
	if (lastVerified) return [auth, newAuthKey];
	return [false, newAuthKey];
}
