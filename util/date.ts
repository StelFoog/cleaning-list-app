export const ISO_DATE_NO_DASH = /^\d{4}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])$/;

export const ISO_DATE = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12]\d|3[01])$/;

export function formatDate(date: string): string {
	if (!date || !date.match(ISO_DATE_NO_DASH)) return date;
	let i = 0;
	return '####-##-##'.replace(/#/g, () => date[i++]);
}
