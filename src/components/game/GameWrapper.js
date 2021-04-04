import {createContext, useReducer} from 'react';
import {getWorkerById, loadWorkers, unlockableWorkers, updateIntervals} from './workers';
import {
	findUpgradeById,
	formatUpgradesForDisplay, getAllAcquiredUpgrades,
	getAvailableUpgradesForDisplay,
	getFactoryDefault,
	getSingleClickData,
	isPartTypeUnlocked
} from '../../services/upgrades/service';
import {factoryUpgrades, getBaseName, partTypes, types} from '../../services/upgrades/data';
import {findWorkerByType, getAvailableWorkersForDisplay, isWorkerTypeUnlocked} from '../../services/workers/service';
import {getWorkerName} from '../../services/workers/data';


const GameContext = createContext();

const actionTypes = {
	clearGameState: 'CLEAR_GAME_STATE',
	addCoins: 'ADD_COINS',
	autoAddCoins: 'AUTO_ADD_COINS',
	recordClick: 'RECORD_CLICK',
	buyUpgrade: 'BUY_UPGRADE',
	buyWorker: 'BUY_WORKER'
};

const saveState = (state) => {
	const stateToSave = {
		...state,
		version: process.env.REACT_APP_VERSION
		// workers: Object.fromEntries(state.workers.map(worker => [worker.id, worker.count]))
	};

	localStorage.setItem('gameState', JSON.stringify(stateToSave));
};

const defaultGameState = () => ({
	factoryLevel: 0,
	totalClicks: 0,
	totalCoins: 99,//0,
	lifetimeCoins: 0,
	itemCountsForStats: Object.fromEntries(Object.values(partTypes).map(type => [type, 0])),
	workers: {},
	upgrades: getFactoryDefault()
});

const loadState = () => {
	const loadedState = JSON.parse(localStorage.getItem('gameState'));
	let shouldClearState = false;
	if (loadedState !== null && (!loadedState.hasOwnProperty('version') || loadedState.version < process.env.REACT_APP_VERSION)) {
		alert('Your game version is out of date, and this game is in active development. I\'m forcing you to start from scratch.');
		shouldClearState = true;
	}

	const defaultState = defaultGameState();

	if (!shouldClearState && loadedState !== null) {
		// loadedState.workers = loadWorkers('factory', loadedState.workers || []);
		return {...defaultState, ...loadedState};
	}
	else {
		return defaultState;
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
			const {numCoinsToAdd, itemCountsForStats} = getSingleClickData(state);

			totalCoins = state.totalCoins + numCoinsToAdd;

			Object.keys(itemCountsForStats).forEach(type => {
				itemCountsForStats[type] += state.itemCountsForStats[type] || 0;
			});

			newState = {...state, totalCoins, lifetimeCoins: state.lifetimeCoins + numCoinsToAdd, itemCountsForStats};
			saveState(newState);
			return newState;
		case actionTypes.autoAddCoins:
			const addedCoins = action.payload.coins;
			totalCoins = state.totalCoins + addedCoins;
			newState = {...state, totalCoins, lifetimeCoins: state.lifetimeCoins + addedCoins};
			saveState(newState);
			return newState;
		case actionTypes.buyUpgrade:
			if (action.payload.type === types.factory) {
				const nextLevel = factoryUpgrades[state.factoryLevel + 1];
				newState = {
					...state,
					factoryLevel: state.factoryLevel + 1,
					totalCoins: state.totalCoins - nextLevel.cost
				};
			}
			else {
				// if you've already bought it, ignore this
				if (state.upgrades.findIndex(upgrade => upgrade.id === action.payload.id) >= 0) {
					return state;
				}
				const item = findUpgradeById(action.payload.id);
				// if you can't afford it, then also ignore it TODO: should i put cost in the payload of this action?
				if (state.totalCoins < item.cost) {
					return state;
				}
				newState = {...state, upgrades: [...state.upgrades, item.id], totalCoins: state.totalCoins - item.cost};
			}
			saveState(newState);
			return newState;
		case actionTypes.buyWorker:
			const updatedWorkers = {...state.workers};

			const workerToBuy = findWorkerByType(action.payload.type);

			// update the worker counts
			if (updatedWorkers.hasOwnProperty(action.payload.type)) {
				updatedWorkers[action.payload.type]++;
			}
			else {
				updatedWorkers[action.payload.type] = 1;
			}

			newState = {
				...state,
				workers: updatedWorkers,
				totalCoins: state.totalCoins - workerToBuy.cost,
				itemCountsForStats: {
					...state.itemCountsForStats,
					[action.payload.type]: state.itemCountsForStats.hasOwnProperty(action.payload.type) ? state.itemCountsForStats[action.payload.type] + 1 : 1
				}
			};

			saveState(newState);
			return newState;
		case actionTypes.clearGameState:
			newState = defaultGameState();
			saveState(newState);
			return newState;
		default:
			return state;
	}
};

function GameWrapper ({children}) {
	const [state, dispatch] = useReducer(gameReducer, {}, loadState);

	// updateIntervals(state, handleAutoIncrement(dispatch));

	const getStats = () => {
		const statsThatMatter = [
			{
				name: 'Lifetime coins',
				coins: state.lifetimeCoins
			},
			{
				name: 'Total clicks',
				count: state.totalClicks
			}
		];
		const acquiredUpgrades = getAllAcquiredUpgrades(state);

		Object.entries(state.itemCountsForStats).forEach(([type, count]) => {
			if (isPartTypeUnlocked(acquiredUpgrades, type)) {
				statsThatMatter.push({
					name: getBaseName(type) + ' sold',
					count
				});
			}
			else if (isWorkerTypeUnlocked(acquiredUpgrades, type)) {
				statsThatMatter.push({
					name: getWorkerName(type),
					count
				})
			}
		});
		return statsThatMatter;
	};


	return (
		<GameContext.Provider value={
			{
				...state,
				stats: getStats(),
				recordClick: () => dispatch({type: actionTypes.recordClick}),
				addCoins: () => dispatch({type: actionTypes.addCoins}),
				buyUpgrade: (type, id) => dispatch({type: actionTypes.buyUpgrade, payload: {type, id}}),
				buyWorker: (type, id) => {
					dispatch({type: actionTypes.buyWorker, payload: {type, id}});
					// updateIntervals(state, handleAutoIncrement(dispatch));
				},
				getAvailableUpgrades: () => getAvailableUpgradesForDisplay(state),
				getAcquiredUpgrades: () => formatUpgradesForDisplay(state),
				getAvailableWorkers: () => getAvailableWorkersForDisplay(state),
				canSeeWorkers: state.factoryLevel > 0,
				resetGame: () => dispatch({type: actionTypes.clearGameState})
			}}
		>
			{children}
		</GameContext.Provider>
	);
}

export {GameContext, GameWrapper};