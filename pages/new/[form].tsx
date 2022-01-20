import { readdirSync, readFileSync } from 'fs';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { Form, Field } from 'react-final-form';
import path from 'path';
import { CleaningCategory, CleaningList } from '../../types/forms';
import styles from '../../styles/Form.module.css';
import LabeledCheck from '../../components/LabeledCheck';
import TextInput from '../../components/TextInput';
import { SubmissionErrors, ValidationErrors } from 'final-form';
import { ISO_DATE_NO_DASH } from '../../util/date';
import { ParsedUrlQuery } from 'querystring';
import FormHeading from '../../components/FormHeading';
import { useState } from 'react';
import Loader from '../../components/Loader';
import { submitForm } from '../../util/api';
import useAuth from '../../util/hooks/useAuth';
import { ThemeProvider } from '@mui/material';
import useMounted from '../../util/hooks/useMounted';
import useMuiTheme from '../../util/hooks/useMuiTheme';
import { useRouter } from 'next/router';
import { toSafe } from '../../util/safePeriod';

interface FormValues {
	checks: Record<string, boolean>;
	name: string;
	phone: string;
	eventDate: string;
	host: string;
	note?: string;
}

interface Props {
	form: CleaningList;
}

type Checks = Record<string, Record<string, Record<string, boolean>>>;

type Unchecked = Record<string, Record<string, string[]>>;

function allUnchecked(checks: Checks): Unchecked {
	const unchecked: Unchecked = {};
	for (const [sc, categories] of Object.entries(checks)) {
		for (const [category, checks] of Object.entries(categories)) {
			for (const [check, isChecked] of Object.entries(checks)) {
				if (!isChecked) {
					if (typeof unchecked[sc] !== 'object') unchecked[sc] = {};
					if (!(unchecked[sc][category] instanceof Array)) unchecked[sc][category] = [];
					unchecked[sc][category].push(check);
				}
			}
		}
	}
	return unchecked;
}

// TODO: Add persistance to form
//   (eg: https://github.com/premieroctet/final-form-persist/blob/master/src/index.ts)
// TODO: Add option for user to have name and phone number preset
const FormPage: NextPage<Props> = (props) => {
	const [loading, setLoading] = useState(false);
	const [auth] = useAuth();
	const muiTheme = useMuiTheme();
	const mounted = useMounted();
	const router = useRouter();

	// In the future this page could and should be expanded to handle other types of forms
	const formData = props.form as CleaningList;

	async function onSubmit(values: FormValues): Promise<SubmissionErrors | void> {
		if (auth) {
			setLoading(true);
			const { checks, name, phone, eventDate, host, note } = values;
			const { type, version } = formData;
			// Inferance of types incorrectly assumes checks is Record<string, boolean>
			// Has to first assert to unknown since overlap Record<string, boolean> to Checks is big enough
			const unchecked = allUnchecked(checks as unknown as Checks);

			const res = await submitForm(auth, {
				name,
				phone,
				eventDate,
				host,
				note: note || null,
				type,
				version,
				omittedChecks: unchecked,
			});
			setLoading(false);
			if (res?.value) router.push('/');
			// handle error if submit didn't work
		}
		// Add error handling to display to user why nothing happend if not authenticated
	}

	function validate(values: FormValues): ValidationErrors {
		const errors: ValidationErrors = {};
		if (!values.name) errors.name = 'Required';
		if (!values.phone) errors.phone = 'Required';
		if (!values.eventDate?.match(ISO_DATE_NO_DASH)) errors.eventDate = 'Invalid date';
		if (!values.eventDate) errors.eventDate = 'Required';
		if (!values.host) errors.host = 'Required';
		// Check if we're missing both a note or any checks
		if (
			(!values.note && !values.checks) ||
			(!values.note && Object.keys(allUnchecked(values.checks as unknown as Checks)).length)
		)
			errors.note = 'Required';

		return errors;
	}

	return (
		<main>
			{loading && <Loader />}
			<FormHeading {...formData} />
			<Form
				onSubmit={onSubmit}
				validate={validate}
				render={({ handleSubmit }) => (
					<form onSubmit={handleSubmit}>
						<SuperCategories form={formData} />
						{/* Has to wait for component to render client–side for theme to be applied */}
						{mounted && (
							<ThemeProvider theme={muiTheme}>
								<Field
									name="name"
									render={({ input, meta }) => (
										<TextInput
											input={input}
											error={meta.touched && (meta.error || meta.submitError)}
											label="Name"
										/>
									)}
								/>
								<Field
									name="phone"
									render={({ input, meta }) => (
										<TextInput
											input={input}
											error={meta.touched && (meta.error || meta.submitError)}
											label="Telephone number"
										/>
									)}
								/>
								<Field
									name="eventDate"
									render={({ input, meta }) => (
										<TextInput
											input={input}
											error={meta.touched && (meta.error || meta.submitError)}
											label="Date of event"
											format="####-##-##"
											mask={['Y', 'Y', 'Y', 'Y', 'M', 'M', 'D', 'D']}
											placeholder="YYYY-MM-DD"
										/>
									)}
								/>
								<Field
									name="host"
									render={({ input, meta }) => (
										<TextInput
											input={input}
											error={meta.touched && (meta.error || meta.submitError)}
											label="Host"
										/>
									)}
								/>
								<Field
									name="note"
									render={({ input, meta }) => (
										<TextInput
											input={input}
											error={meta.touched && (meta.error || meta.submitError)}
											label="Note"
											multiline
										/>
									)}
								/>
							</ThemeProvider>
						)}
						<div className="contentSplit" />
						<button type="submit">Click</button>
					</form>
				)}
			/>
		</main>
	);
};

function SuperCategories({ form }: { form: CleaningList }): JSX.Element {
	const { superCategories } = form;
	const keys = Object.keys(superCategories);
	return (
		<>
			{keys.map((key) => {
				const val = superCategories[key];
				return (
					<div className={styles.superCategory} key={key}>
						<h3>{val.title}</h3>
						<Categories
							categories={val.categories}
							superCategory={key}
							color={form.meta.colors[key]}
						/>
						{val.note && <span className={styles.note}>{val.note}</span>}
					</div>
				);
			})}
		</>
	);
}

function Categories({
	categories,
	superCategory,
	color,
}: {
	categories: Record<string, CleaningCategory>;
	superCategory: string;
	color?: string;
}): JSX.Element {
	const keys = Object.keys(categories);
	return (
		<div>
			{keys.map((key) => {
				const val = categories[key];
				return (
					<div key={key}>
						{val.title && <h4>{val.title}</h4>}
						{val.checks.map((check) => (
							<Field
								key={check}
								// replace '.' with '\·' as '.' is used to mark a key in an object. Should be converted back before it's displayed for the user
								name={`checks.${superCategory}.${key}.${toSafe(check)}`}
								defaultValue={false}
								render={({ input, meta }) => (
									<LabeledCheck
										key={check}
										label={check}
										value={input.value}
										onChange={input.onChange}
										color={color || undefined}
										labelColor="var(--foreground)"
										{...meta}
									/>
								)}
							/>
						))}
					</div>
				);
			})}
		</div>
	);
}

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
	// could use '/forms/en/', both should contain the exact same filenames
	const filenames = readdirSync(path.join(process.cwd(), 'forms', 'sv'));

	const paths: { params: ParsedUrlQuery; locale: string }[] = [];
	filenames.forEach((filename) => {
		// remove .json from the end of filenames
		const name = filename.substring(0, filename.length - 5);
		locales?.forEach((locale) => {
			paths.push({ params: { form: name }, locale });
		});
	});

	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
	// We know that params will contain form as a string array since page would be 404 otherwise
	const form = (params as { form: string }).form;
	const formData: CleaningList = JSON.parse(
		readFileSync(path.join(process.cwd(), 'forms', locale as string, `${form}.json`)).toString()
	);

	return { props: { form: formData }, revalidate: false };
};

export default FormPage;
