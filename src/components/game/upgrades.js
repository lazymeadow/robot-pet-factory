class Upgrade {
	static upgradeCount = 0;

	constructor (
		name,
		description,
		clickIncrement = 0,
		clickMultiplier = 1,
		cost = 0,
	) {
		this.id = (Upgrade.upgradeCount++).toString().padStart(8, '0');
		this.name = name;
		this.description = description;
		this.clickIncrement = clickIncrement;
		this.clickMultiplier = clickMultiplier;
		this.cost = cost;
		this.dependencies = [];
	}

	isVisible = (state) => {
		return this.dependencies.reduce((acc, curr) => {
			return acc && isUpgradePresent(state, curr)
		}, !isUpgradePresent(state, this));
	}

	static newFreeIncrementUpgrade = (name, description, clickIncrement) => {
		return new Upgrade(name, description, clickIncrement, 1, 0);
	};

	static newIncrementUpgrade = (name, description, clickIncrement, cost) => {
		return new Upgrade(name, description, clickIncrement, 1, cost);
	};

	static newMultiplierUpgrade = (name, description, clickMultiplier, cost) => {
		return new Upgrade(name, description, 0, clickMultiplier, cost);
	};

	static newFeatureUpgrade = (name, description, cost) => {
		return new Upgrade(name, description, 0, 1, cost);
	}
}

/* DEFINE UPGRADES */
const wires0 = Upgrade.newFreeIncrementUpgrade(
	'Wires',
	'Every click makes a wire. Wires are worth 1 coin.',
	1
);

const unlockWorkers = Upgrade.newFeatureUpgrade(
	'Workers',
	'You can hire robot workers to make your wires automatically.',
	200
);

const moreWires1 = Upgrade.newIncrementUpgrade(
	'More Wires',
	'Every click makes two wires.',
	1,
	100
);
const moreWires2 = Upgrade.newIncrementUpgrade(
	'Even More Wires',
	'Every click makes four wires.',
	2,
	500
);
const betterWires1 = Upgrade.newMultiplierUpgrade(
	'Better Wires',
	'Your wires are better, and are worth twice as much.',
	2,
	100
);
const betterWires2 = Upgrade.newMultiplierUpgrade(
	'Even Better Wires',
	'Your wires are better, and are worth four times as much.',
	2,
	500
);

/* SET UPGRADE DEPENDENCIES */
unlockWorkers.dependencies = [moreWires1, betterWires1];
moreWires1.dependencies = [wires0];
moreWires2.dependencies = [moreWires1];
betterWires1.dependencies = [wires0];
betterWires2.dependencies = [betterWires1];

export const defaultFactoryUpgrades = [
	wires0
];

const isUpgradePresent = (state, upgradeToFind) => {
	return state.upgrades.findIndex(upgrade => upgrade.id === upgradeToFind.id) >= 0;
};

export const canSeeWorkers = (state) => isUpgradePresent(state, unlockWorkers);

export const unlockableUpgrades = {
	factory: [
		...defaultFactoryUpgrades,
		moreWires1,
		moreWires2,
		betterWires1,
		betterWires2,
		unlockWorkers,
	]
};

export const loadUpgrades = (type, upgradeIds) => {
	return unlockableUpgrades[type].filter(upgrade => upgradeIds.includes(upgrade.id));
};
