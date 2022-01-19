import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useEffect } from 'react';
import useSWR from 'swr';
import useAuth from './useAuth';

export default function useAxios<T = any>(url: string, options: AxiosRequestConfig = {}) {
	const [auth] = useAuth();
	const { data, error, mutate } = useSWR<T>(`/api/${url}`, async (url) => {
		if (auth) {
			return axios
				.get(url, {
					headers: { Authorization: auth },
					timeout: 5000,
					timeoutErrorMessage: "Couldn't get a response from the server",
					...options,
				})
				.then((res: AxiosResponse<T>) => res.data);
		} else return new Promise((res) => res);
	});

	useEffect(() => {
		if (auth) mutate();
	}, [auth, mutate]);

	const loading = auth === null || (!data && !error);

	if (auth === false) return { error: 'No authentication', loading };

	return { data: data as T, error, loading };
}
