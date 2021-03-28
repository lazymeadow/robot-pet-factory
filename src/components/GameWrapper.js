import {createContext, useReducer} from 'react';

const GameContext = createContext();

const actionTypes = {
	addCoins: 'ADD_COINS',
	recordClick: 'RECORD_CLICK'
}

const gameReducer = (state, action) => {
	switch (action.type) {
		case actionTypes.recordClick:
			let totalClicks = state.totalClicks + 1;
			localStorage.setItem('totalClicks', totalClicks);
			return {...state, totalClicks};
		case actionTypes.addCoins:
			// calculate the coins to add
			const numCoinsToAdd = 1;

			const totalCoins = state.totalCoins + numCoinsToAdd;

			// save new coin total to local storage
			// FIXME: make cheat proof
			localStorage.setItem('totalCoins', totalCoins);

			return {...state, totalCoins};
		default:
			return state;
	}
};

function GameWrapper({children}) {
	const getInitialState = () => ({
		totalClicks: parseInt(localStorage.getItem('totalClicks')) || 0,
		totalCoins:  parseInt(localStorage.getItem('totalCoins')) || 0
	});

	const [state, dispatch] = useReducer(gameReducer, {}, getInitialState);

	return (
		<GameContext.Provider value={
			{
				...state,
				recordClick: () => dispatch({type: actionTypes.recordClick}),
				addCoins: () => dispatch({type: actionTypes.addCoins})
			}
		}>
			{children}
		</GameContext.Provider>
	)
}

export {GameContext, GameWrapper};