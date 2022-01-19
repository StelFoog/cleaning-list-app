import { readdirSync, readFileSync } from 'fs';
import { GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import path from 'path';
import styles from '../../styles/Forms.module.css';
import { CleaningList, ListTypes } from '../../types/forms';

interface Props {
	forms: { title: string; type: ListTypes }[];
}

const Forms: NextPage<Props> = ({ forms }) => {
	return (
		<main>
			<h1>Forms</h1>
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	// could use '/forms/en/', both should contain the exact same filenames
	const filenames = readdirSync(path.join(process.cwd(), 'forms', 'sv'));

	const forms: { title: string; type: ListTypes }[] = [];
	filenames.forEach((filename) => {
		// remove .json from the end of filenames
		const form: CleaningList = JSON.parse(
			readFileSync(path.join(process.cwd(), 'forms', locale as string, filename)).toString()
		);
		forms.push(form);
	});

	return { props: { forms }, revalidate: false };
};

export default Forms;
