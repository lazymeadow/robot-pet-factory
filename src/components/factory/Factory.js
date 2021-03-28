// import {ViewContext} from '../../App';
import TwoPanel from '../TwoPanel';
import {Tab, TabContent, Tabs, TabsContainer} from '../Tabs';
import {GameContext} from '../game/GameWrapper';


export default function Factory () {
	const renderTabs = () => (
		<GameContext.Consumer>
			{({buyUpgrade, getAvailableUpgrades, lifetimeCoins, totalClicks, totalCoins}) => (
				<>
					<h2>Factory</h2>
					<Tabs>
						<TabsContainer>
							<Tab tabKey={0}>Upgrades</Tab>
							<Tab tabKey={1}>Stats</Tab>
							<Tab tabKey={2}>Achievements</Tab>
						</TabsContainer>
						<TabContent tabKey={0}>
							{getAvailableUpgrades('factory').map(upgrade => {
								let extraClass = '';
								let helperText = '';
								if (upgrade.purchased) {
									extraClass = 'unavailable';
									helperText = 'You already have this!';
								}
								else if (upgrade.cost > totalCoins) {
									extraClass = 'expensive';
									helperText = 'You can\'t buy this yet.';
								}
								else {
									helperText = 'You can buy this!';
								}

								return (
									<div key={upgrade.id}
										 className={`upgrade ${extraClass}`}
										 role={'button'}
										 onClick={() => buyUpgrade('factory', upgrade.id)}
									>
										<div className={'upgrade-title'}>
											<h3>{upgrade.name}</h3>
											{!upgrade.purchased && <span>COST: {upgrade.cost}C</span>}
										</div>
										<p>{upgrade.description}</p>
										<small>{helperText}</small>
									</div>
								);
							})}
						</TabContent>
						<TabContent tabKey={1}>
							Stats go here
							<ul>
								<li>Click Count: {totalClicks}</li>
								<li>Total Coins Earned: {lifetimeCoins}</li>
							</ul>
						</TabContent>
						<TabContent tabKey={2}>Achivements go here</TabContent>
					</Tabs>
				</>
			)}
		</GameContext.Consumer>
	);

	const renderMain = () => (
		<GameContext.Consumer>
			{({addCoins, recordClick, upgrades}) => (
				<>
					<button className={'factory'} onClick={() => {
						recordClick();
						addCoins();
					}}>
						<img src={''} alt={'the factory'}/>
					</button>
					<div>
						<ol>
							{upgrades.map(upgrade => <li key={upgrade.id}>{upgrade.name}</li>)}
						</ol>
					</div>
				</>
			)}
		</GameContext.Consumer>
	);

	return (
		<TwoPanel tabsContent={renderTabs()} mainContent={renderMain()}/>
	);
}