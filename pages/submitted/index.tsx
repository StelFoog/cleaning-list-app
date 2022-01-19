import { ChevronRightIcon } from '@primer/octicons-react';
import { NextPage } from 'next';
import Link from 'next/link';
import Loader from '../../components/Loader';
import styles from '../../styles/Submitted.module.css';
import { ListableForm, ResData } from '../../types/db';
import { formatDate } from '../../util/date';
import useAxios from '../../util/hooks/useAxios';

const SubmittedList: NextPage = () => {
	const { data, error, loading } = useAxios<ResData<ListableForm[]>>('get');

	const documents = data?.value;

	return (
		<>
			<main>
				{loading && <Loader />}
				<h1>Submitted Forms</h1>
				{documents instanceof Array && (
					<ul className={styles.list}>
						{documents.map((doc) => (
							<Item key={doc._id.toString()} form={doc} />
						))}
					</ul>
				)}
				{error && (
					<div>
						<h3>An error has occured</h3>
						<p>{error}</p>
					</div>
				)}
			</main>
		</>
	);
};

function Item({ form }: { form: ListableForm }): JSX.Element {
	return (
		<Link href={`/submitted/${form._id}`} passHref>
			<li className={styles.item}>
				<div>
					<div className={styles.itemContentUpper}>
						{form.type}
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

export default SubmittedList;
