export const defaultFactoryUpgrades = [{
	id: 'wires0',
	name: 'Wires',
	description: 'Every click makes a wire.',
	clickIncrement: 0,
	clickMultiplier: 1,
	cost: 0,
	isUnlocked: () => true
}];

export const unlockableUpgrades = {
	factory: [
		...defaultFactoryUpgrades,
		{
			id: 'wires1',
			name: 'More Wires',
			description: 'Every click makes you two wires',
			clickIncrement: 1,  // this is how many extra clicks you get for this
			clickMultiplier: 1,  // this is the multiplier, applied after increment total
			cost: 100,
			isUnlocked: (state) => state.upgrades.findIndex(upgrade => upgrade.id === 'wires0') >= 0
		}
	]
};