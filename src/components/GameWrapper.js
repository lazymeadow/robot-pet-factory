import {createContext, useReducer} from 'react';

const GameContext = createContext();

const actionTypes = {
	addCoins: 'addCoins'
}

const gameReducer = (state, action) => {
	switch (action.type) {
		case actionTypes.addCoins:
			// calculate the coins to add
			const numCoinsToAdd = 1;

			const newTotalCoins = state.totalCoins + numCoinsToAdd;

			// save new coin total to local storage
			// FIXME: make cheat proof
			localStorage.setItem('totalCoins', newTotalCoins);

			return {...state, totalCoins: newTotalCoins};
		default:
			return state;
	}
};

function GameWrapper({children}) {
	const getInitialState = () => ({
		totalCoins:  parseInt(localStorage.getItem('totalCoins')) || 0
	});

	const [state, dispatch] = useReducer(gameReducer, {}, getInitialState);

	return (
		<GameContext.Provider value={
			{
				...state,
				addCoins: () => dispatch({type: actionTypes.addCoins})
			}
		}>
			{children}
		</GameContext.Provider>
	)
}

export {GameContext, GameWrapper};