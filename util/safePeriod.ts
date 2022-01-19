export function toSafe(str: string): string {
	return str.replace(/\./g, '\\·');
}

export function fromSafe(str: string): string {
	return str.replace(/\\·/g, '.');
}
