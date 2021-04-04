import {createContext, useReducer} from 'react';
import {
	findUpgradeById,
	formatUpgradesForDisplay,
	getAllAcquiredUpgrades,
	getAvailableUpgradesForDisplay,
	getFactoryDefault,
	getSingleClickData, getWorkerIncrementData,
	isPartTypeUnlocked
} from '../../services/upgrades/service';
import {factoryUpgrades, getBaseName, partTypes, types} from '../../services/upgrades/data';
import {findWorkerByType, getAvailableWorkersForDisplay, isWorkerTypeUnlocked} from '../../services/workers/service';
import {getWorkerName} from '../../services/workers/data';


const GameContext = createContext();

const actionTypes = {
	init: 'INIT',
	clearGameState: 'CLEAR_GAME_STATE',
	addCoins: 'ADD_COINS',
	autoAddCoinsForWorkers: 'AUTO_ADD_COINS',
	recordClick: 'RECORD_CLICK',
	buyUpgrade: 'BUY_UPGRADE',
	buyWorker: 'BUY_WORKER'
};

const saveState = ({loading: _, ...state}) => {
	const stateToSave = {
		...state,
		version: process.env.REACT_APP_VERSION
	};

	localStorage.setItem('gameState', JSON.stringify(stateToSave));
};

const defaultGameState = () => ({
	loading: true,
	factoryLevel: 0,
	totalClicks: 0,
	totalCoins: 0,
	lifetimeCoins: 0,
	workerLifetimeCoins: 0,
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

const gameReducer = (state, action) => {
	let newState, totalCoins;
	switch (action.type) {
		case actionTypes.init:
			return {...state, loading: false};
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
		case actionTypes.autoAddCoinsForWorkers:
			let totalCoinsToAdd = 0;
			const totalItemCountsForStats = {};

			// iterate over the workers who are updating
			action.payload.workers.forEach(worker => {
				const {numCoinsToAdd, itemCountsForStats} = getWorkerIncrementData(state, worker);
				totalCoinsToAdd += numCoinsToAdd;
				Object.assign(totalItemCountsForStats, itemCountsForStats);
			});

			Object.keys(totalItemCountsForStats).forEach(type => {
				totalItemCountsForStats[type] += state.itemCountsForStats[type] || 0;
			});

			newState = {
				...state,
				totalCoins: state.totalCoins + totalCoinsToAdd,
				// tally coins earned by this worker type for stats
				workerLifetimeCoins: state.workerLifetimeCoins + totalCoinsToAdd,
				itemCountsForStats: {...state.itemCountsForStats, ...totalItemCountsForStats}
			};

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
			const currentFactoryLevel = factoryUpgrades[state.factoryLevel];
			const workerToBuy = findWorkerByType(action.payload.type);

			// if you've hit your max for this type, don't add one.
			if (currentFactoryLevel.workerMax <= updatedWorkers[action.payload.type]) {
				return state;
			}

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


const handleAutoIncrement = (dispatch) => (workersWhoDelivered) => {
	dispatch({type: actionTypes.autoAddCoinsForWorkers, payload: {workers: workersWhoDelivered}});
};


const intervalIds = [];
const updateIntervals = (gameState, incrementHandler) => {
	// first clean up all the existing intervals
	intervalIds.forEach(intervalId => window.clearInterval(intervalId));
	intervalIds.splice(0);
	// then go make new intervals for the items that already exist.
	// map the intervals by duration
	const intervalMap = {};
	Object.entries(gameState.workers).forEach(([workerType, count]) => {
		const worker = findWorkerByType(workerType);

		if (!intervalMap.hasOwnProperty(worker.interval)) {
			intervalMap[worker.interval] = [];
		}
		intervalMap[worker.interval].push(workerType);
	});
	for (const [interval, workers] of Object.entries(intervalMap)) {
		if (!!interval) {
			intervalIds.push(
				window.setInterval(() => {
						incrementHandler(workers);
					},
					interval * 1000
				)
			);
		}
	}
};

function GameWrapper ({children}) {
	const [state, dispatch] = useReducer(gameReducer, {}, loadState);

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

		// can see workers fl 1+
		if (state.factoryLevel > 0) {
			statsThatMatter.push({
				name: 'Total coins earned by workers',
				coins: state.workerLifetimeCoins
			});
		}

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
				});
			}
		});
		return statsThatMatter;
	};

	if (state.loading) {
		dispatch({type: actionTypes.init});
		updateIntervals(state, handleAutoIncrement(dispatch));
	}

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
					updateIntervals(state, handleAutoIncrement(dispatch));
				},
				getAvailableUpgrades: () => getAvailableUpgradesForDisplay(state),
				getAcquiredUpgrades: () => formatUpgradesForDisplay(state),
				getAvailableWorkers: () => getAvailableWorkersForDisplay(state),
				canSeeWorkers: state.factoryLevel > 0,
				resetGame: () => dispatch({type: actionTypes.clearGameState}),
				currentMaxWorkers: factoryUpgrades[state.factoryLevel].workerMax
			}}
		>
			{children}
		</GameContext.Provider>
	);
}

export {GameContext, GameWrapper};