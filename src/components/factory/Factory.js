// import {ViewContext} from '../../App';
import TwoPanel from '../TwoPanel';
import {Tab, TabContent, Tabs, TabsContainer} from '../Tabs';
import {GameContext} from '../GameWrapper';


export default function Factory () {
	const renderTabs = () => (
		<GameContext.Consumer>
			{({totalClicks, totalCoins}) => (
				<>
					<h2>Factory</h2>
					<Tabs>
						<TabsContainer>
							<Tab tabKey={0}>Upgrades</Tab>
							<Tab tabKey={1}>Stats</Tab>
							<Tab tabKey={2}>Achievements</Tab>
						</TabsContainer>
						<TabContent tabKey={0}>Upgrades go here</TabContent>
						<TabContent tabKey={1}>
							Stats go here
							<ul>
								<li>Click Count: {totalClicks}</li>
								<li>Total Coins: {totalCoins}</li>
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
			{({addCoins, recordClick}) => (
				<>
					<h2>Here we go</h2>
					<button className={'factory'} onClick={() => {
						recordClick();
						addCoins();
					}}>
						<img src={''} alt={'the factory'}/>
					</button>
				</>
			)}
		</GameContext.Consumer>
	);

	return (
		<TwoPanel tabsContent={renderTabs()} mainContent={renderMain()}/>
	);
}