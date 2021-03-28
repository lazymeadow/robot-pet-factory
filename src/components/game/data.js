class Upgrade {
	constructor (
		id,
		name,
		description,
		clickIncrement = 0,
		clickMultiplier = 1,
		cost = 0,
		isUnlockedFn = () => true
	) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.clickIncrement = clickIncrement;
		this.clickMultiplier = clickMultiplier;
		this.cost = cost;
		this.isUnlocked = isUnlockedFn;
	}

	static newFreeIncrementUpgrade = (id, name, description, clickIncrement) => {
		return new Upgrade(id, name, description, clickIncrement);
	};

	static newIncrementUpgrade = (id, name, description, clickIncrement, cost, isUnlockedFn) => {
		return new Upgrade(id, name, description, clickIncrement, 1, cost, isUnlockedFn);
	};

	static newMultiplierUpgrade = (id, name, description, clickMultiplier, cost, isUnlockedFn) => {
		return new Upgrade(id, name, description, 0, clickMultiplier, cost, isUnlockedFn);
	};
}

const wires0 = Upgrade.newFreeIncrementUpgrade(
	'wires0',
	'Wires',
	'Every click makes a wire. Wires are worth 1 coin.',
	1
);

const moreWires1 = Upgrade.newIncrementUpgrade(
	'wires1',
	'More Wires',
	'Every click makes two wires.',
	1,
	100,
	(state) => isUpgradePresent(state, wires0.id)
);
const moreWires2 = Upgrade.newIncrementUpgrade(
	'wires2',
	'Even More Wires',
	'Every click makes four wires.',
	2,
	500,
	(state) => isUpgradePresent(state, moreWires1.id)
);
const betterWires1 = Upgrade.newMultiplierUpgrade(
	'better1',
	'Better Wires',
	'Your wires are better, and are worth twice as much.',
	2,
	100,
	(state) => isUpgradePresent(state, wires0.id)
);
const betterWires2 = Upgrade.newMultiplierUpgrade(
	'better2',
	'Even Better Wires',
	'Your wires are better, and are worth four times as much.',
	2,
	500,
	(state) => {
		return isUpgradePresent(state, betterWires1.id) && isUpgradePresent(state, moreWires2.id);
	}
);

export const defaultFactoryUpgrades = [
	wires0
];

const isUpgradePresent = (state, upgradeId) => {
	return state.upgrades.findIndex(upgrade => upgrade.id === upgradeId) >= 0;
};

export const unlockableUpgrades = {
	factory: [
		...defaultFactoryUpgrades,
		moreWires1,
		betterWires1,
		moreWires2,
		betterWires2,
	]
};