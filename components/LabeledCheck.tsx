import styles from '../styles/LabeledCheck.module.css';

interface Props {
	label: string;
	value?: boolean;
	onChange?: (value: boolean) => any;
	color?: string; // should be implemented in the future
	labelColor?: string; // defaults to black
	borderColor?: string; // defaults to labelColor
	changeLabelChecked?: boolean;
}

export default function LabeledCheck({
	label,
	value,
	onChange = () => {},
	color = '#3498db',
	labelColor = 'black',
	borderColor = labelColor,
	changeLabelChecked = true,
}: Props): JSX.Element {
	return (
		<label className={styles.container}>
			<input
				className={styles.input}
				style={{ borderColor }}
				type="checkbox"
				checked={value}
				onChange={(e) => onChange(e.target.checked)}
			/>
			<span style={{ borderColor }} className={styles.checkbox}>
				<span style={{ borderColor, color }} />
			</span>
			<span
				className={`${styles.label} ${changeLabelChecked ? styles['label-change'] : ''}`}
				style={{ color: labelColor }}
			>
				{label}
			</span>
		</label>
	);
}
