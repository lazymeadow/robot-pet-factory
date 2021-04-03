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
								<div className={'upgrade-title'}>
									<h4>{upgrade.name}</h4>
									{!upgrade.purchased && <span>COST: {upgrade.cost} C</span>}
								</div>
								<p>{upgrade.description}</p>
								<small>{helperText}</small>
							</div>
						);
					})}
				</>
			);
		});
	};

	const renderTabs = () => (
		<GameContext.Consumer>
			{({buyUpgrade, buyWorker, canSeeWorkers, getAvailableUpgrades, getAvailableWorkers, lifetimeCoins, totalClicks, totalCoins}) => {
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
											 onClick={() => buyWorker(worker.type, worker.id)}
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
								{upgrades.map(upgrade =>{
								return <li key={upgrade.id}>{upgrade.name}</li>
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