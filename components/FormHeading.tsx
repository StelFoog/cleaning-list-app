import styles from '../styles/FormHeading.module.css';

interface Props {
	title: string;
	version: string;
}

export default function FormHeading({ title, version }: Props): JSX.Element {
	return (
		<div className={styles.heading}>
			<h2>{title}</h2>
			<span className={styles.version}>{`Version ${version}`}</span>
		</div>
	);
}
