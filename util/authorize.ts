import { sha256 } from 'hash.js';

export function authorize(auth: string | undefined): boolean {
	return !!auth && sha256().update(auth).digest('hex') === process.env.AUTH_HASH;
}
