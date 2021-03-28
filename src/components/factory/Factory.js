import TwoPanel from '../TwoPanel';
import {Tab, TabContent, Tabs, TabsContainer} from '../Tabs';
import {GameContext} from '../game/GameWrapper';


export default function Factory () {
	const renderTabs = () => (
		<GameContext.Consumer>
			{({buyUpgrade, buyWorker, canSeeWorkers, getAvailableUpgrades, getAvailableWorkers, lifetimeCoins, totalClicks, totalCoins}) => {
				const availableUpgrades = getAvailableUpgrades('factory');
				const availableWorkers = getAvailableWorkers('factory');
				return (
					<>
						<h2>Factory</h2>
						<Tabs defaultTabKey={'upgrades'}>
							<TabsContainer>
								<Tab tabKey={'upgrades'}>Upgrades</Tab>
								{canSeeWorkers && <Tab tabKey={'workers'}>Workers</Tab>}
								<Tab tabKey={'stats'}>Stats</Tab>
								<Tab tabKey={'achievements'}>Achievements</Tab>
							</TabsContainer>
							<TabContent tabKey={'upgrades'}>
								<span>{totalCoins} C</span>
								{availableUpgrades.map(upgrade => {
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
												{!upgrade.purchased && <span>COST: {upgrade.cost} C</span>}
											</div>
											<p>{upgrade.description}</p>
											<small>{helperText}</small>
										</div>
									);
								})}
							</TabContent>
							<TabContent tabKey={'stats'}>
								<ul>
									<li>Click Count: {totalClicks}</li>
									<li>Total Coins Earned: {lifetimeCoins} C</li>
								</ul>
							</TabContent>
							<TabContent tabKey={'achievements'}>Achivements go here</TabContent>
							<TabContent tabKey={'workers'}>
								{availableWorkers.map(worker => {
									let extraClass = '';
									let helperText = '';
									if (worker.cost > totalCoins) {
										extraClass = 'expensive';
										helperText = 'You can\'t buy this right now.';
									}
									else {
										helperText = 'You can buy this!';
									}

									return (
										<div key={worker.id}
											 className={`upgrade ${extraClass}`}
											 role={'button'}
											 onClick={() => buyWorker('factory', worker.id)}
										>
											<div className={'upgrade-title'}>
												<h3>{worker.name} ({worker.count})</h3>
												<span>COST: {worker.cost} C</span>
											</div>
											<p>{worker.description}</p>
											<small>{helperText}</small>
										</div>
									);
								})}
							</TabContent>
						</Tabs>
					</>
				);
			}}
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
						<img src={''} alt={'the factory - click to make wires'}/>
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