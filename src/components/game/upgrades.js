class Upgrade {
	static upgradeCount = 0;

	constructor (
		name,
		description,
		clickIncrement = 0,
		clickMultiplier = 1,
		cost = 0,
		isVisibleFn = () => true
	) {
		this.id = (Upgrade.upgradeCount++).toString().padStart(8, '0');
		this.name = name;
		this.description = description;
		this.clickIncrement = clickIncrement;
		this.clickMultiplier = clickMultiplier;
		this.cost = cost;
		this.isVisible = isVisibleFn;
	}

	static newFreeIncrementUpgrade = (name, description, clickIncrement, isVisibleFn) => {
		return new Upgrade(name, description, clickIncrement, 1, 0, isVisibleFn);
	};

	static newIncrementUpgrade = (name, description, clickIncrement, cost, isVisibleFn) => {
		return new Upgrade(name, description, clickIncrement, 1, cost, isVisibleFn);
	};

	static newMultiplierUpgrade = (name, description, clickMultiplier, cost, isVisibleFn) => {
		return new Upgrade(name, description, 0, clickMultiplier, cost, isVisibleFn);
	};
}

const wires0 = Upgrade.newFreeIncrementUpgrade(
	'Wires',
	'Every click makes a wire. Wires are worth 1 coin.',
	1,
	(state) => !isUpgradePresent(state, moreWires1)
);

const moreWires1 = Upgrade.newIncrementUpgrade(
	'More Wires',
	'Every click makes two wires.',
	1,
	100,
	(state) => isUpgradePresent(state, wires0) && !isUpgradePresent(state, moreWires2)
);
const moreWires2 = Upgrade.newIncrementUpgrade(
	'Even More Wires',
	'Every click makes four wires.',
	2,
	500,
	(state) => isUpgradePresent(state, moreWires1)
);
const betterWires1 = Upgrade.newMultiplierUpgrade(
	'Better Wires',
	'Your wires are better, and are worth twice as much.',
	2,
	100,
	(state) => isUpgradePresent(state, wires0) && !isUpgradePresent(state, betterWires2)
);
const betterWires2 = Upgrade.newMultiplierUpgrade(
	'Even Better Wires',
	'Your wires are better, and are worth four times as much.',
	2,
	500,
	(state) => isUpgradePresent(state, betterWires1) && isUpgradePresent(state, moreWires2)
);

export const defaultFactoryUpgrades = [
	wires0
];

const isUpgradePresent = (state, upgradeToFind) => {
	return state.upgrades.findIndex(upgrade => upgrade.id === upgradeToFind.id) >= 0;
};

export const unlockableUpgrades = {
	factory: [
		...defaultFactoryUpgrades,
		moreWires1,
		moreWires2,
		betterWires1,
		betterWires2
	]
};

export const loadUpgrades = (type, upgradeIds) => {
	return unlockableUpgrades[type].filter(upgrade => upgradeIds.includes(upgrade.id));
};
