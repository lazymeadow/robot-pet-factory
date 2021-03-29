import {ViewContext} from '../../App';
import {GameContext} from '../game/GameWrapper';


export default function Overview () {
	return (
		<ViewContext.Consumer>
			{({showFactory, showKennel}) => (
				<GameContext.Consumer>
					{({resetGame}) => (
						<div className="overview">
							<div>
								<h2>Factory</h2>
								<ul>
									<li>Interesting Stats</li>
									<li>What are they</li>
								</ul>
								<button onClick={showFactory}>Go to Factory</button>
							</div>
							<div>
								<h2>Tools</h2>
								<p>Hey. You probably want to do this if your game seems broken.</p>
								<button onClick={resetGame}>Reset Game</button>
							</div>
							<div>
								<h2>Pet Kennel</h2>
								<ul>
									<li>Interesting Stats</li>
									<li>What are they</li>
								</ul>
								<button onClick={showKennel}>Go to Pets</button>
							</div>
						</div>
					)}
				</GameContext.Consumer>
			)}
		</ViewContext.Consumer>
	);
}