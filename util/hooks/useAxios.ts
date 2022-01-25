import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import useSWR from 'swr';
import useAuth from './useAuth';

export default function useAxios<T = any>(url: string, options: AxiosRequestConfig = {}) {
	const [auth] = useAuth();
	const { data, error } = useSWR<T>(auth !== null ? `/api/${url}` : null, async (url) => {
		if (auth) {
			return axios
				.get(url, {
					headers: { Authorization: auth },
					timeout: 5000,
					timeoutErrorMessage: "Couldn't get a response from the server",
					...options,
				})
				.then((res: AxiosResponse<T>) => res.data)
				.catch((e) => {
					if (e.response) {
						throw {
							message: e.response.data.error,
							deauthenticated: e.response.data.deauthenticated,
						};
					}
					throw { message: e.message };
				});
		} else {
			throw {
				deauthenticated: true,
			};
		}
	});

	const loading = auth === null || (!data && !error);

	if (auth === false) return { error: 'No authentication', loading };

	return { data: data as T, error, loading };
}
