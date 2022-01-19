interface Props {
	text: string;
	open: boolean;
	action: Function;
	close: Function;
	closeButton?: Function;
}

export default function Dialog({ text, open, action, close, closeButton }: Props): JSX.Element {
	return (
		<div>
			<div></div>
		</div>
	);
}
