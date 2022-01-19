import TextField from '@mui/material/TextField';
import React from 'react';
import { FieldInputProps } from 'react-final-form';
import NumberFormat from 'react-number-format';
import styles from '../styles/TextInput.module.css';

interface Props {
	input: FieldInputProps<any, HTMLElement>;
	label?: string;
	error?: string | false;
	placeholder?: string;
	multiline?: boolean;
	fullWidth?: boolean;
	format?: string;
	mask?: string | string[];
	labelColor?: string;
}

// Should be replaced with another component with similar functionality in the future since mui field has poor suport for custom theming. As it stands these fields have to be rendered client-side in order to get the corect theme
export default function TextInput({
	input,
	label,
	error,
	placeholder,
	multiline = false,
	fullWidth = false,
	format,
	mask,
}: Props): JSX.Element {
	const { onChange, value, ...rest } = input;
	return format ? (
		<NumberFormat
			{...rest}
			customInput={TextField}
			format={format}
			mask={mask}
			label={label}
			error={!!error}
			helperText={error || ' '}
			placeholder={placeholder}
			fullWidth={fullWidth}
			onValueChange={({ value }) => input.onChange(value)}
			value={input.value}
			type="text"
			variant="outlined"
		/>
	) : (
		<TextField
			{...input}
			label={label}
			error={!!error}
			helperText={error || ' '}
			placeholder={placeholder}
			multiline={multiline}
			fullWidth={fullWidth}
			type="text"
			variant="outlined"
		/>
	);
}
