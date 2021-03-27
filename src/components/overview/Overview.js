import {ViewContext} from '../../App';


export default function Overview () {
	return (
		<ViewContext.Consumer>
			{({showFactory, showKennel}) => (
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
						<h2>Pet Kennel</h2>
						<ul>
							<li>Interesting Stats</li>
							<li>What are they</li>
						</ul>
						<button onClick={showKennel}>Go to Pets</button>
					</div>
				</div>
			)}
		</ViewContext.Consumer>
	);
}