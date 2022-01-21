import { ObjectID } from 'bson';
import { readFileSync } from 'fs';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import path from 'path';
import FormHeading from '../../components/FormHeading';
import Loader from '../../components/Loader';
import styles from '../../styles/SubmittedForm.module.css';
import { Unchecked, ResData, SubmittedList } from '../../types/db';
import { CleaningList } from '../../types/forms';
import { formatDate } from '../../util/date';
import useAxios from '../../util/hooks/useAxios';
import { fromSafe } from '../../util/safePeriod';
import { documentType } from '../api/type';

interface Props {
	id: string;
	form: CleaningList;
}

const List: NextPage<Props> = ({ id, form }) => {
	const { data, loading } = useAxios<ResData<SubmittedList>>('get', { params: { id } });
	const list = data?.value;

	return (
		<main>
			{loading && <Loader />}
			<FormHeading title={form.title} version={form.version} />
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
					{list.omittedChecks && Object.keys(list.omittedChecks).length > 0 ? (
						<OmittedChecks omittedChecks={list.omittedChecks} form={form} />
					) : (
						<h3 style={{ color: '#4a5' }}>All checks completed!</h3>
					)}
				</>
			)}
		</main>
	);
};

function OmittedChecks({
	omittedChecks,
	form,
}: {
	omittedChecks: Unchecked;
	form: CleaningList;
}): JSX.Element {
	return (
		<>
			<h3>Omitted checks</h3>
			<div className={styles.omitted}>
				{Object.entries(omittedChecks).map(([sc, category]) => (
					<div key={sc}>
						<h4>{form.superCategories[sc].title}</h4>
						<div className={styles.omitted}>
							{Object.entries(category).map(([cat, checks]) => (
								<div key={cat}>
									{form.superCategories[sc].categories[cat].title && (
										<span>{form.superCategories[sc].categories[cat].title}</span>
									)}
									<div className={styles.omitted}>
										{checks.map((check) => (
											<span key={check}>{fromSafe(check)}</span>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				))}
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

	return { props: { id, form: fileData }, revalidate: 100 };
};

export default List;
