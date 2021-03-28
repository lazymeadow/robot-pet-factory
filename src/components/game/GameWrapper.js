import {createContext, useReducer} from 'react';
import {defaultFactoryUpgrades, loadUpgrades, unlockableUpgrades} from './upgrades';


const GameContext = createContext();

const actionTypes = {
	addCoins: 'ADD_COINS',
	recordClick: 'RECORD_CLICK',
	buyUpgrade: 'BUY_UPGRADE'
};

const saveState = (state) => {
	const stateToSave = {
		...state,
		upgrades: state.upgrades.map(upgrade => upgrade.id)
	};

	localStorage.setItem('gameState', JSON.stringify(stateToSave));
};

const loadState = () => {
	const loadedState = JSON.parse(localStorage.getItem('gameState'));
	loadedState.upgrades = loadUpgrades('factory', loadedState.upgrades);
	return loadedState;
};

const gameReducer = (state, action) => {
	let newState;
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

			const totalCoins = state.totalCoins + numCoinsToAdd;

			newState = {...state, totalCoins, lifetimeCoins: state.lifetimeCoins + numCoinsToAdd};
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
		default:
			return state;
	}
};

function GameWrapper ({children}) {
	const getInitialState = () => {
		const gameState = loadState();
		if (gameState !== null) {
			return gameState;
		}
		return {
			totalClicks: 0,
			totalCoins: 0,
			lifetimeCoins: 0,
			upgrades: defaultFactoryUpgrades
		};
	};

	const [state, dispatch] = useReducer(gameReducer, {}, getInitialState);

	const getAvailableUpgrades = (type) => {
		const upgradesList = unlockableUpgrades[type];
		return upgradesList.filter(upgrade => {
			// the upgrade must not have been purchased AND must be available by upgrade criteria
			upgrade.purchased = state.upgrades.findIndex((value) => value.id === upgrade.id) >= 0;
			let visible = upgrade.isVisible(state);
			return visible;
		});
	};

	return (
		<GameContext.Provider value={
			{
				...state,
				recordClick: () => dispatch({type: actionTypes.recordClick}),
				addCoins: () => dispatch({type: actionTypes.addCoins}),
				buyUpgrade: (type, id) => dispatch({type: actionTypes.buyUpgrade, payload: {type, id}}),
				getAvailableUpgrades
			}}
		>
			{children}
		</GameContext.Provider>
	);
}

export {GameContext, GameWrapper};