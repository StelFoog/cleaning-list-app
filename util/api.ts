import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { ResData, SubmittableList } from '../types/db';

function instance(auth: string): AxiosInstance {
	return axios.create({
		baseURL: '/api/',
		timeout: 5000,
		timeoutErrorMessage: "Could't get a responce from the server", // maybe improve clarity
		headers: {
			Authorization: auth,
		},
	});
}

export async function submitForm(auth: string, form: SubmittableList): Promise<ResData<string>> {
	return instance(auth)
		.put('/make', form)
		.then((res: AxiosResponse<ResData<string>>) => res.data)
		.catch((error: AxiosError<ResData<string>>) => {
			if (error.response) return error.response.data;
			else return { error: error.message };
		});
}
