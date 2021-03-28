import {GameContext} from './GameWrapper';
import {ViewContext} from '../App';


export default function Header () {
	return (
		<ViewContext.Consumer>
			{({isCurrentViewFactory, isCurrentViewKennel, isCurrentViewOverview, showFactory, showKennel, showOverview}) => (
				<GameContext.Consumer>
					{({totalCoins}) => (
						<header>
							<h1 role={"button"} onClick={showOverview}>Robot Pets</h1>
							<nav>
								<ol>
									<li className={isCurrentViewOverview() ? 'current' : ''}
										role={'button'}
										onClick={showOverview}
									>
										Overview
									</li>
									<li className={isCurrentViewFactory() ? 'current' : ''}
										role={'button'}
										onClick={showFactory}
									>
										Factory
									</li>
									<li className={isCurrentViewKennel() ? 'current' : ''}
										role={'button'}
										onClick={showKennel}
									>
										Kennel
									</li>
								</ol>
							</nav>
							<div>Total Coins: {totalCoins}</div>
						</header>
					)}
				</GameContext.Consumer>
			)}
		</ViewContext.Consumer>
	);
}