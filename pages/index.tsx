import { ChevronRightIcon, FileIcon, GearIcon, Icon, InboxIcon } from '@primer/octicons-react';
import type { NextPage } from 'next';
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

const Home: NextPage = () => {
	const [auth, newAuth] = useAuth();

	return (
		<>
			<Head>
				<title>Cleaning List App</title>
				<meta name="description" content="A digitalization of the Kistan 2.0 cleaning list" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main>
				{auth === null && <Loader />}
				<h1>Cleaning List</h1>
				<div className={`expand ${!auth && 'center'}`}>
					{!auth && <AddAuthentication newAuth={newAuth} />}
					{auth && <Authenticated />}
				</div>
			</main>
		</>
	);
};

function AddAuthentication({ newAuth }: { newAuth: NewAuth }): JSX.Element {
	const router = useRouter();
	const muiTheme = useMuiTheme();
	const mounted = useMounted();

	async function onSubmit({ auth }: { auth: string }): Promise<SubmissionErrors | void> {
		const result = await newAuth(auth);
		if (!result) {
			toast.error('INvalid authentication key');
			return { auth: 'INvalid authentication key' };
		} else if (typeof router.query.back === 'string') router.push(router.query.back);
	}

	function validate({ auth }: { auth: string }) {
		const errors: { auth?: string } = {};
		if (!auth) errors.auth = 'Required';
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
					<button type="submit">Authenticate</button>
				</form>
			)}
		/>
	);
}

function Authenticated(): JSX.Element {
	return (
		<ul className={styles.list}>
			<Option Icon={FileIcon} text="New Form" link="/new" />
			<Option Icon={InboxIcon} text="Submitted Forms" link="/submitted" />
			<Option Icon={GearIcon} text="Settings" link="/settings" />
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

export default Home;
