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
import { fromSafe } from '../../util/safePeriod';
import { documentType } from '../api/type';

interface Props extends Translations {
	id: string;
	form: CleaningList;
}

const List: NextPage<Props> = ({ id, form, translations }) => {
	const { data, loading } = useAxios<ResData<SubmittedList>>('get', { params: { id } });
	const list = data?.value;

	const l10n = localize(translations).instance(`forms.${form.type}`);

	return (
		<main>
			{loading && <Loader />}
			<FormHeading title={l10n('title')} version={form.version} />
			{typeof list === 'object' && (
				<>
					<table>
						<tbody className={styles.table}>
							<tr>
								<td>Name:</td>
								<td>{list.name}</td>
							</tr>
							<tr>
								<td>Phone:</td>
								<td>{list.phone}</td>
							</tr>
							<tr>
								<td>Event Date:</td>
								<td>{formatDate(list.eventDate)}</td>
							</tr>
							<tr>
								<td>Host:</td>
								<td>{list.host}</td>
							</tr>
							{list.note && (
								<tr>
									<td>Note:</td>
									<td>{list.note}</td>
								</tr>
							)}
						</tbody>
					</table>
					{list.omittedChecks &&
						(Object.keys(list.omittedChecks).length > 0 ? (
							<OmittedChecks omittedChecks={list.omittedChecks} form={form} l10n={l10n} />
						) : (
							<h3 style={{ color: '#4a5' }}>All checks completed!</h3>
						))}
				</>
			)}
		</main>
	);
};

function OmittedChecks({
	omittedChecks,
	form,
	l10n,
}: {
	omittedChecks: Unchecked;
	form: CleaningList;
	l10n: Localization;
}): JSX.Element {
	return (
		<>
			<h3>Omitted checks</h3>
			<div className={styles.omitted}>
				{Object.entries(omittedChecks).map(([sc, category]) => {
					const scInstance = l10n.instance(`superCategories.${sc}`);

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
		readFileSync(
			path.join(process.cwd(), 'forms', locale as string, `${type as string}.json`)
		).toString()
	);

	const translations = getTranslations(locale as string, [`forms.${type}`]);

	return { props: { id, form: fileData, translations }, revalidate: 100 };
};

export default List;
