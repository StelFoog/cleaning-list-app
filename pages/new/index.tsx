import { readdirSync, readFileSync } from 'fs';
import { GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import path from 'path';
import styles from '../../styles/Forms.module.css';
import { CleaningList, ListTypes } from '../../types/forms';
import { Translations } from '../../types/Translations';
import { getTranslations } from '../../util/getLocalizations';
import localize from '../../util/localize';

interface Props extends Translations {
	forms: { title: string; type: ListTypes }[];
}

const Forms: NextPage<Props> = ({ forms, translations }) => {
	const l10n = localize(translations).instance('pages.new-form-list');
	return (
		<main>
			<h1>{l10n('title')}</h1>
			{forms.map((form) => (
				<Option title={form.title} link={form.type} key={form.type} />
			))}
		</main>
	);
};

function Option({ title, link }: { title: string; link: string }) {
	return (
		<Link href={`/new/${link}`} passHref>
			<span className={styles.option}>{title}</span>
		</Link>
	);
}

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => {
	// could use '/forms/en/', both should contain the exact same filenames
	const filenames = readdirSync(path.join(process.cwd(), 'forms'));

	const forms: { title: string; type: ListTypes }[] = [];
	const l10n = localize(getTranslations(locale as string, ['forms'])).instance('forms');
	filenames.forEach((filename) => {
		// remove .json from the end of filenames
		const { type }: CleaningList = JSON.parse(
			readFileSync(path.join(process.cwd(), 'forms', filename)).toString()
		);

		forms.push({ type, title: l10n(`${type}.title`) });
	});

	const translations = getTranslations(locale as string, ['pages.new-form-list']);

	return { props: { forms, translations }, revalidate: false };
};

export default Forms;
