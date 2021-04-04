import TwoPanel from '../TwoPanel';
import {Tab, TabContent, Tabs, TabsContainer} from '../Tabs';
import {GameContext} from '../game/GameWrapper';


export default function Factory () {
	const renderAvailableUpgrades = (availableUpgrades, totalCoins, buyUpgrade) => {
		if (availableUpgrades.length === 0) {
			return (
				<div>
					No available upgrades!
				</div>
			);
		}
		return availableUpgrades.map(({categoryName, upgrades}) => {
			return (
				<>
					<h3>{categoryName}</h3>
					{upgrades.map(upgrade => {
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
								 onClick={() => buyUpgrade(upgrade.type, upgrade.id)}
							>
								<div className={'upgrade-image'}>
									<img src={''} alt={`${upgrade.id}`} />
								</div>
								<div>
									<div className={'upgrade-title'}>
										<h4>{upgrade.name}</h4>
										{!upgrade.purchased && <span>COST: {upgrade.cost} C</span>}
									</div>
									<p>{upgrade.description}</p>
									<small>{helperText}</small>
								</div>
							</div>
						);
					})}
				</>
			);
		});
	};

	const renderAvailableWorkers = (availableWorkers, totalCoins, buyWorker, currentMaxWorkers) => {
		if (availableWorkers.length === 0) {
			return (
				<div>
					No available workers!
				</div>
			);
		}
		return availableWorkers.map(worker => {
			let extraClass = '';
			let helperText = '';
			if (worker.count >= currentMaxWorkers) {
				extraClass = 'unavailable';
				helperText = 'Upgrade your factory to buy more of these.';
			}
			else if (worker.cost > totalCoins) {
				extraClass = 'expensive';
				helperText = 'You don\'t have enough coins.';
			}
			else {
				helperText = 'You can buy this!';
			}

			return (
				<div key={worker.id}
					 className={`upgrade ${extraClass}`}
					 role={'button'}
					 onClick={() => buyWorker(worker.type)}
				>
					<div className={'upgrade-image'}>
						<img src={''} alt={`${worker.id}`} />
					</div>
					<div>
						<div className={'upgrade-title'}>
							<h4>{worker.name} ({worker.count})</h4>
							<span>COST: {worker.cost} C</span>
						</div>
						<p>{worker.description}</p>
						<small>{helperText}</small>
					</div>
				</div>
			);
		});
	};

	const renderTabs = () => (
		<GameContext.Consumer>
			{({buyUpgrade, buyWorker, canSeeWorkers, getAvailableUpgrades, getAvailableWorkers, stats, totalCoins, currentMaxWorkers}) => {
				const availableUpgrades = getAvailableUpgrades('factory');
				const availableWorkers = getAvailableWorkers('factory');
				return (
					<>
						<Tabs defaultTabKey={'upgrades'}>
							<TabsContainer>
								<Tab tabKey={'upgrades'}>Upgrades</Tab>
								{canSeeWorkers && <Tab tabKey={'workers'}>Workers</Tab>}
								<Tab tabKey={'stats'}>Stats</Tab>
								<Tab tabKey={'achievements'}>Achievements</Tab>
							</TabsContainer>
							<TabContent tabKey={'upgrades'}>
								<span>{totalCoins} C</span>
								{renderAvailableUpgrades(availableUpgrades, totalCoins, buyUpgrade)}
							</TabContent>
							<TabContent tabKey={'stats'}>
								<ul>
									{stats.map(stat => <li>{stat.name}: {stat.coins >= 0 ? `${stat.coins} C` : stat.count}</li>)}
								</ul>
							</TabContent>
							<TabContent tabKey={'achievements'}>Achivements go here</TabContent>
							<TabContent tabKey={'workers'}>
								{renderAvailableWorkers(availableWorkers, totalCoins, buyWorker, currentMaxWorkers)}
							</TabContent>
						</Tabs>
					</>
				);
			}}
		</GameContext.Consumer>
	);

	const renderMain = () => (
		<GameContext.Consumer>
			{({addCoins, recordClick, getAcquiredUpgrades}) => {
				const upgrades = getAcquiredUpgrades();
				return (
					<>
						<button id={'factory'} onClick={() => {
							recordClick();
							addCoins();
						}}>
							<img src={''} alt={'the factory - click to make parts'}/>
						</button>
						<div>
							<h3>Upgrades you have:</h3>
							<ol>
								{upgrades.map(upgrade => {
									return <li key={upgrade.id}>{upgrade.name}</li>;
								})}
							</ol>
						</div>
					</>
				);
			}}
		</GameContext.Consumer>
	);

	return (
		<TwoPanel tabsContent={renderTabs()} mainContent={renderMain()}/>
	);
}