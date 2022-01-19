import style from '../styles/Loader.module.css';

function Loader(): JSX.Element {
	return (
		<div className={style.cover}>
			<div className={style.loader}>
				<div>
					<div>
						<div>
							<div />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Loader;
