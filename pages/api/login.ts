// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { authorize } from '../../util/authorize';
import delay from '../../util/delay';

type ResData = {
	success: boolean;
	error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResData>) {
	await delay(500);
	const { method, headers } = req;
	if (method !== 'GET') {
		res.status(405).json({ success: false, error: 'INcorrect method' });
		return;
	}
	if (!authorize(headers.authorization)) {
		res.status(401).json({ success: false, error: 'INvalid authorization header' });
		return;
	}
	// Handle correct request
	res.status(200).json({ success: true });
}
