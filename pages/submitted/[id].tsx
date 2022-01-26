import { ObjectID } from 'bson';
import { readFileSync } from 'fs';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import path from 'path';
import FormHeading from '../../components/FormHeading';
import Loader from '../../components/Loader';
import styles from '../../styles/SubmittedForm.module.css';
import { Unchecked, ResData, SubmittedList } from '../../types/db';
import { CleaningList } from '../../types/forms';
import { Translations } from '../../types/Translations';
import { formatDate } from '../../util/date';
import { getTranslations } from '../../util/getLocalizations';
import useAxios from '../../util/hooks/useAxios';
import localize, { Localization } from '../../util/localize';
import { documentType } from '../api/type';

interface Props extends Translations {
	id: string;
	form: CleaningList;
}

const List: NextPage<Props> = ({ id, form, translations }) => {
	const { data, loading } = useAxios<ResData<SubmittedList>>('get', { params: { id } });
	const list = data?.value;

	const l10n = localize(translations);
	const formInstance = l10n.instance(`forms.${form.type}`);
	const inputInstance = l10n.instance('general.input');
	const pageInstance = l10n.instance('pages.submitted-form');

	return (
		<main>
			{loading && <Loader />}
			<FormHeading title={formInstance('title')} version={list?.version} />
			{typeof list === 'object' && (
				<>
					<table>
						<tbody className={styles.table}>
							<tr>
								<td>{inputInstance('name') + ':'}</td>
								<td>{list.name}</td>
							</tr>
							<tr>
								<td>{inputInstance('phone') + ':'}</td>
								<td>{list.phone}</td>
							</tr>
							<tr>
								<td>{inputInstance('event-date') + ':'}</td>
								<td>{formatDate(list.eventDate)}</td>
							</tr>
							<tr>
								<td>{inputInstance('host') + ':'}</td>
								<td>{list.host}</td>
							</tr>
							{list.note && (
								<tr>
									<td>{inputInstance('note') + ':'}</td>
									<td>{list.note}</td>
								</tr>
							)}
						</tbody>
					</table>
					{list.omittedChecks &&
						(Object.keys(list.omittedChecks).length > 0 ? (
							<OmittedChecks
								omittedChecks={list.omittedChecks}
								formInstance={formInstance}
								title={pageInstance('omitted-checks')}
							/>
						) : (
							<h3 style={{ color: '#4a5' }}>{pageInstance('all-checks-complete')}</h3>
						))}
				</>
			)}
		</main>
	);
};

function OmittedChecks({
	omittedChecks,
	formInstance,
	title,
}: {
	omittedChecks: Unchecked;
	formInstance: Localization;
	title: string;
}): JSX.Element {
	return (
		<>
			<h3>{title}</h3>
			<div className={styles.omitted}>
				{Object.entries(omittedChecks).map(([sc, category]) => {
					const scInstance = formInstance.instance(`superCategories.${sc}`);

					return (
						<div key={sc}>
							<h4>{scInstance('title')}</h4>
							<div className={styles.omitted}>
								{Object.entries(category).map(([cat, checks]) => {
									const catInstance = scInstance.instance(`categories.${cat}`);
									const title = catInstance('title');

									return (
										<div key={cat}>
											{title && <span>{title}</span>}
											<div className={styles.omitted}>
												{checks.map((check) => (
													<span key={check}>{catInstance(`checks.${check}`)}</span>
												))}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</>
	);
}

export const getStaticPaths: GetStaticPaths = async () => {
	return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
	const { id } = params as { id: string };
	if (id.length !== 24) return { notFound: true, revalidate: 100 };

	const { exists, type } = await documentType(new ObjectID(id));
	if (!exists) return { notFound: true, revalidate: 10 };

	const fileData: CleaningList = JSON.parse(
		readFileSync(path.join(process.cwd(), 'forms', `${type as string}.json`)).toString()
	);

	const translations = getTranslations(locale as string, [
		`forms.${type}`,
		'general.input',
		'pages.submitted-form',
	]);

	return { props: { id, form: fileData, translations }, revalidate: 100 };
};

export default List;
