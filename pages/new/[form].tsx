import { ThemeProvider } from '@mui/material';
import { SubmissionErrors, ValidationErrors } from 'final-form';
import { readdirSync, readFileSync } from 'fs';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import path from 'path';
import { ParsedUrlQuery } from 'querystring';
import { useState } from 'react';
import { Field, Form } from 'react-final-form';
import FormHeading from '../../components/FormHeading';
import LabeledCheck from '../../components/LabeledCheck';
import Loader from '../../components/Loader';
import TextInput from '../../components/TextInput';
import styles from '../../styles/Form.module.css';
import { CleaningCategory, CleaningList } from '../../types/forms';
import { submitForm } from '../../util/api';
import useFormPersist from '../../util/hooks/useFormPersist';
import { ISO_DATE_NO_DASH } from '../../util/date';
import useAuth from '../../util/hooks/useAuth';
import useMounted from '../../util/hooks/useMounted';
import useMuiTheme from '../../util/hooks/useMuiTheme';
import { toSafe } from '../../util/safePeriod';
import { toast } from 'react-toastify';

interface Props {
	form: CleaningList;
}

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

const FormPage: NextPage<Props> = (props) => {
	const [loading, setLoading] = useState(false);
	const [auth] = useAuth();
	const muiTheme = useMuiTheme();
	const mounted = useMounted();
	const router = useRouter();
	const { persistMutator, PersistSpy, clearPersistance } = useFormPersist({
		whitelist: ['checks', 'note'],
	});

	// In the future this page could and should be expanded to handle other types of forms
	const formData = props.form;

	function noAuthentication(): void {
		toast.warn(
			<div>
				<span>{'Not authenticated!'}</span>
				<br />
				<span>{"Don't worry, everything will still be where you left it 🙂"}</span>
			</div>
		);
		router.push(`/?back=${router.asPath}`);
	}

	async function onSubmit(formValues: object): Promise<SubmissionErrors | void> {
		if (auth) {
			setLoading(true);
			const { checks, name, phone, eventDate, host, note } = formValues as FormValues;
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
			if (res?.value) {
				clearPersistance();
				setLoading(false);
				toast.success('Successful submit');
				router.push('/');
			} else {
				if (res?.deauthenticated) noAuthentication();
				if (res?.error) toast.error(res.error);
			}
		} else noAuthentication();
	}

	function validate(formValues: object): ValidationErrors {
		const values = formValues as FormValues;

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
			errors.note = 'Required, must explain why checks were left unchecked';

		return errors;
	}

	return (
		<main>
			{loading && <Loader />}
			<FormHeading {...formData} />
			<Form
				onSubmit={onSubmit}
				validate={validate}
				mutators={{ persistMutator }}
				subscription={{ submitting: true, pristine: true }}
				render={({ handleSubmit, form }) => (
					<form onSubmit={handleSubmit}>
						<PersistSpy
							mutate={form.mutators.persistMutator}
							type={formData.type}
							version={formData.version}
						/>
						<SuperCategories form={formData} />
						<div className="contentSplit" />
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
						<button type="submit">Submit</button>
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
