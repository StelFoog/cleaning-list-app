import { ChevronRightIcon } from '@primer/octicons-react';
import { readdirSync } from 'fs';
import { GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import path from 'path';
import Loader from '../../components/Loader';
import styles from '../../styles/Submitted.module.css';
import { ListableForm, ResData } from '../../types/db';
import { Translations } from '../../types/Translations';
import { formatDate } from '../../util/date';
import { getTranslations } from '../../util/getLocalizations';
import useAxios from '../../util/hooks/useAxios';
import localize, { Localization } from '../../util/localize';

const SubmittedList: NextPage<Translations> = ({ translations }) => {
	const { data, loading } = useAxios<ResData<ListableForm[]>>('get');

	const documents = data?.value;

	const l10n = localize(translations);
	const pageInstance = l10n.instance('pages.submitted-form-list');
	const formsInstance = l10n.instance('forms');

	return (
		<>
			<main>
				{loading && <Loader />}
				<h1>{pageInstance('title')}</h1>
				{documents && documents instanceof Array && (
					<ul className={styles.list}>
						{documents.map((doc) => (
							<Item key={doc._id.toString()} form={doc} formsInstance={formsInstance} />
						))}
					</ul>
				)}
			</main>
		</>
	);
};

function Item({
	form,
	formsInstance,
}: {
	form: ListableForm;
	formsInstance: Localization;
}): JSX.Element {
	return (
		<Link href={`/submitted/${form._id}`} passHref>
			<li className={styles.item}>
				<div>
					<div className={styles.itemContentUpper}>
						{formsInstance(`${form.type}.title`)}
						<span className={styles.itemVersion}>(v{form.version})</span>
					</div>
					<div className={styles.itemContentLower}>
						<span>{formatDate(form.eventDate)}</span>
						<span>{form.host}</span>
					</div>
				</div>
				<ChevronRightIcon size={24} verticalAlign="middle" />
			</li>
		</Link>
	);
}

export const getStaticProps: GetStaticProps<Translations> = async ({ locale }) => {
	const filenames = readdirSync(path.join(process.cwd(), 'forms'));
	const translations = getTranslations(locale as string, [
		...filenames.map((file) => `forms.${file.slice(0, -5)}.title`),
		'pages.submitted-form-list',
	]);

	return { props: { translations } };
};

export default SubmittedList;
