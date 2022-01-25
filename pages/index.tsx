import { ChevronRightIcon, FileIcon, GearIcon, Icon, InboxIcon } from '@primer/octicons-react';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import useAuth, { NewAuth } from '../util/hooks/useAuth';
import Loader from '../components/Loader';
import { Field, Form } from 'react-final-form';
import TextInput from '../components/TextInput';
import { SubmissionErrors } from 'final-form';
import { ThemeProvider } from '@mui/material';
import useMuiTheme from '../util/hooks/useMuiTheme';
import useMounted from '../util/hooks/useMounted';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Translations } from '../types/Translations';
import { getTranslations } from '../util/getLocalizations';
import localize, { Localization } from '../util/localize';

const Home: NextPage<Translations> = ({ translations }) => {
	const [auth, newAuth] = useAuth();

	// console.log(translations);

	const l10n = localize(translations);
	const pageInstance = l10n.instance('pages.home');

	return (
		<>
			<Head>
				<title>{pageInstance('meta-title')}</title>
				<meta name="description" content={pageInstance('meta-desc')} />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main>
				{auth === null && <Loader />}
				<h1>{pageInstance('title')}</h1>
				<div className={`expand ${!auth && 'center'}`}>
					{!auth && <AddAuthentication newAuth={newAuth} l10n={l10n} />}
					{auth && <Authenticated pageInstance={pageInstance} />}
				</div>
			</main>
		</>
	);
};

function AddAuthentication({
	newAuth,
	l10n,
}: {
	newAuth: NewAuth;
	l10n: Localization;
}): JSX.Element {
	const router = useRouter();
	const muiTheme = useMuiTheme();
	const mounted = useMounted();

	const pageInstance = l10n.instance('pages.home');

	async function onSubmit({ auth }: { auth: string }): Promise<SubmissionErrors | void> {
		const result = await newAuth(auth);
		if (!result) {
			toast.error(pageInstance('authentication-error'));
			return { auth: pageInstance('authentication-error') };
		} else if (typeof router.query.back === 'string') router.push(router.query.back);
	}

	function validate({ auth }: { auth: string }) {
		const errors: { auth?: string } = {};
		if (!auth) errors.auth = l10n('general.required');
		return errors;
	}

	return (
		<Form
			onSubmit={onSubmit}
			validate={validate}
			render={({ handleSubmit }) => (
				<form onSubmit={handleSubmit}>
					{mounted && (
						<ThemeProvider theme={muiTheme}>
							<Field
								name="auth"
								render={({ input, meta }) => (
									<TextInput
										input={input}
										error={
											meta.touched &&
											(meta.error || (!meta.dirtySinceLastSubmit && meta.submitError))
										}
									/>
								)}
							/>
						</ThemeProvider>
					)}
					<div className="contentSplit" />
					<button type="submit">{pageInstance('authenticate')}</button>
				</form>
			)}
		/>
	);
}

function Authenticated({ pageInstance }: { pageInstance: Localization }): JSX.Element {
	return (
		<ul className={styles.list}>
			<Option Icon={FileIcon} text={pageInstance('new-form')} link="/new" />
			<Option Icon={InboxIcon} text={pageInstance('submitted-forms')} link="/submitted" />
			<Option Icon={GearIcon} text={pageInstance('settings')} link="/settings" />
		</ul>
	);
}

function Option({ Icon, text, link }: { Icon: Icon; text: string; link: string }): JSX.Element {
	const ICON_SIZE = 24;
	return (
		<Link href={link} passHref>
			<li className={styles.item}>
				<Icon size={ICON_SIZE} verticalAlign="middle" />
				<span>{text}</span>
				<ChevronRightIcon size={ICON_SIZE} verticalAlign="middle" />
			</li>
		</Link>
	);
}

export const getStaticProps: GetStaticProps<Translations> = async ({ locale }) => {
	const translations = getTranslations(locale as string, ['pages.home', 'general.required']);

	return { props: { translations } };
};

export default Home;
