import { Mutator } from 'final-form';
import objectHash from 'object-hash';
import { ReactNode, useEffect, useState } from 'react';
import { FormSpy } from 'react-final-form';
import { ListTypes } from '../../types/forms';
import useLocalState from './useLocalState';

type FormValues = Record<string, any>;

interface FormPersistProps {
	whitelist: string[];
	storeKey?: string;
	debounce?: number;
}

interface FormPersistResult {
	PersistSpy: (props: Omit<AutoSaveProps, 'values'>) => JSX.Element;
	persistMutator: Mutator;
	clearPersistance: () => void;
}

interface AutoSaveProps {
	mutate: (persistValues: object) => void;
	version: string;
	type: ListTypes;
	values: FormValues;
}

interface StoreValues {
	type: ListTypes;
	version: string;
	values: FormValues;
}

export default function useFormPersist({
	whitelist,
	storeKey = 'cleaning::form-perist-checks',
	debounce = 1000,
}: FormPersistProps): FormPersistResult {
	const [persist, setPersist] = useLocalState<StoreValues>(storeKey);

	const persistMutator: Mutator = ([persistValues]: [FormValues], state, { changeValue }) => {
		whitelist.forEach((key) => {
			changeValue(state, key, () => persistValues[key]);
		});
	};

	function AutoSave({ mutate, version, type, values }: AutoSaveProps): JSX.Element {
		const [hash, setHash] = useState(objectHash(values));
		const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
		const [restored, setRestored] = useState(false);

		useEffect(() => {
			if (!restored && persist !== undefined) {
				setRestored(true);
				if (persist && persist.type === type && persist.version === version) {
					const newHash = objectHash(persist.values);
					if (hash !== newHash) {
						setHash(newHash);
						console.log(mutate);
						mutate(persist.values);
					}
				}
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [persist]);

		useEffect(() => {
			if (timer) clearTimeout(timer);
			setTimer(
				setTimeout(() => {
					const newHash = objectHash(values);
					if (hash !== newHash) {
						const whitelistedValues: FormValues = {};
						whitelist.forEach((key) => {
							const value = values[key];
							if (value) whitelistedValues[key] = value;
						});
						setHash(newHash);
						setPersist({ type, version, values: whitelistedValues });
					}
				}, debounce)
			);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [values]);

		return <></>;
	}

	function PersistSpy({ mutate, type, version }: Omit<AutoSaveProps, 'values'>): JSX.Element {
		return (
			<FormSpy
				subscription={{ values: true }}
				render={({ values }) => (
					<AutoSave mutate={mutate} type={type} version={version} values={values} />
				)}
			/>
		);
	}

	function clearPersistance(): void {
		setPersist(null);
	}

	return { persistMutator, PersistSpy, clearPersistance };
}
