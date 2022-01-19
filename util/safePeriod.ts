export function toSafe(str: string): string {
	return str.replaceAll('.', '\\·');
}

export function fromSafe(str: string): string {
	return str.replaceAll('\\·', '.');
}
