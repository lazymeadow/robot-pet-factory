import {createContext, useReducer} from 'react';
import {canSeeWorkers, defaultFactoryUpgrades, loadUpgrades, unlockableUpgrades} from './upgrades';
import {getWorkerById, loadWorkers, unlockableWorkers, updateIntervals} from './workers';


const GameContext = createContext();

const actionTypes = {
	addCoins: 'ADD_COINS',
	autoAddCoins: 'AUTO_ADD_COINS',
	recordClick: 'RECORD_CLICK',
	buyUpgrade: 'BUY_UPGRADE',
	buyWorker: 'BUY_WORKER'
};

const saveState = (state) => {
	const stateToSave = {
		...state,
		upgrades: state.upgrades.map(upgrade => upgrade.id),
		workers: Object.fromEntries(state.workers.map(worker => [worker.id, worker.count]))
	};

	localStorage.setItem('gameState', JSON.stringify(stateToSave));
};

const loadState = () => {
	const loadedState = JSON.parse(localStorage.getItem('gameState'));
	if (loadedState !== null) {
		loadedState.upgrades = loadUpgrades('factory', loadedState.upgrades || []);
		loadedState.workers = loadWorkers('factory', loadedState.workers || []);
		return loadedState;
	}
	else {
		return {
			totalClicks: 0,
			totalCoins: 0,
			lifetimeCoins: 0,
			workers: [],
			upgrades: defaultFactoryUpgrades
		};
	}
};


const handleAutoIncrement = (dispatch) => (coins) => {
	dispatch({type: actionTypes.autoAddCoins, payload: {coins}});
};

const gameReducer = (state, action) => {
	let newState, totalCoins;
	switch (action.type) {
		case actionTypes.recordClick:
			let totalClicks = state.totalClicks + 1;
			newState = {...state, totalClicks};
			saveState(newState);
			return newState;
		case actionTypes.addCoins:
			let countPerClick = state.upgrades.reduce((acc, cur) => acc + cur.clickIncrement, 0);
			let multiplier = state.upgrades.reduce((acc, cur) => acc * cur.clickMultiplier, 1);
			// calculate the coins to add: always use multiplier on the total clicks
			const numCoinsToAdd = (countPerClick) * multiplier;

			totalCoins = state.totalCoins + numCoinsToAdd;

			newState = {...state, totalCoins, lifetimeCoins: state.lifetimeCoins + numCoinsToAdd};
			saveState(newState);
			return newState;
		case actionTypes.autoAddCoins:
			const addedCoins = action.payload.coins;
			totalCoins = state.totalCoins + addedCoins;
			newState = {...state, totalCoins, lifetimeCoins: state.lifetimeCoins + addedCoins};
			saveState(newState);
			return newState;
		case actionTypes.buyUpgrade:
			if (state.upgrades.findIndex(upgrade => upgrade.id === action.payload.id) >= 0) {
				return state;
			}
			const item = unlockableUpgrades[action.payload.type].find(upgrade => upgrade.id === action.payload.id);
			if (state.totalCoins < item.cost) {
				return state;
			}

			newState = {...state, upgrades: [...state.upgrades, item], totalCoins: state.totalCoins - item.cost};
			saveState(newState);
			return newState;
		case actionTypes.buyWorker:
			const foundWorker = state.workers.find(worker => worker.id === action.payload.id);
			if (foundWorker) {
				if (foundWorker.cost > state.totalCoins) {
					return state;
				}
				foundWorker.addWorker();
				newState = {...state, totalCoins: state.totalCoins - foundWorker.cost};
			}
			else {
				const workerToAdd = getWorkerById(action.payload.type, action.payload.id);
				if (workerToAdd.cost > state.totalCoins) {
					return state;
				}
				workerToAdd.addWorker();
				newState = {
					...state,
					workers: [...state.workers, workerToAdd],
					totalCoins: state.totalCoins - workerToAdd.cost
				};
				saveState(newState);
			}
			return newState;
		default:
			return state;
	}
};

function GameWrapper ({children}) {
	const [state, dispatch] = useReducer(gameReducer, {}, loadState);

	updateIntervals(state, handleAutoIncrement(dispatch));

	const getAvailableUpgrades = (type) => {
		const upgradesList = unlockableUpgrades[type];
		return upgradesList.filter(upgrade => {
			// the upgrade must not have been purchased AND must be available by upgrade criteria
			upgrade.purchased = state.upgrades.findIndex((value) => value.id === upgrade.id) >= 0;
			return upgrade.isVisible(state);
		});
	};

	const getAvailableWorkers = (type) => {
		const workerList = [...unlockableWorkers[type]];
		return workerList.filter(worker => worker.isVisible(state));
	};


	return (
		<GameContext.Provider value={
			{
				...state,
				recordClick: () => dispatch({type: actionTypes.recordClick}),
				addCoins: () => dispatch({type: actionTypes.addCoins}),
				buyUpgrade: (type, id) => dispatch({type: actionTypes.buyUpgrade, payload: {type, id}}),
				buyWorker: (type, id) => {
					dispatch({type: actionTypes.buyWorker, payload: {type, id}});
					updateIntervals(state, handleAutoIncrement(dispatch));
				},
				getAvailableUpgrades,
				getAvailableWorkers,
				canSeeWorkers: canSeeWorkers(state)
			}}
		>
			{children}
		</GameContext.Provider>
	);
}

export {GameContext, GameWrapper};