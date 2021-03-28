import {
	factoryPartUpgrades,
	getBaseDesc,
	getBaseName, getDefaultFactoryUpgrades,
	getQualityDesc,
	getQualityName,
	getQuantityDesc,
	getQuantityName
} from './data';


export const findUpgradeById = (id) => {
	// must traverse the entire upgrades map until we find it
	// first level is part types
	for (const [partType, {unlock, quantity, quality}] of Object.entries(factoryPartUpgrades)) {
		if (unlock.id === id) {
			return {
				...unlock,
				type: partType
			};
		}
		const foundInQuantity = quantity.find(upgrade => upgrade.id === id);
		if (foundInQuantity) {
			return {
				...foundInQuantity,
				incrementer: unlock.incrementer,
				type: partType
			};
		}
		const foundInQuality = quality.find(upgrade => upgrade.id === id);
		if (foundInQuality) {
			return {
				...foundInQuality,
				multiplier: unlock.multiplier,
				type: partType
			};
		}
	}
};

export const getSingleClickIncrement = (gameState) => {
	const mathsMap = {};  // each type will be under its key. accumulate, then do the math individually to get a total
	gameState.upgrades.forEach(upgradeId => {
		const {type, level, incrementer, multiplier} = findUpgradeById(upgradeId);
		if (!mathsMap.hasOwnProperty(type)) {
			mathsMap[type] = {
				incrementer,
				multiplier,
				maxLevel: level || 0  // base unlocks don't have a level
			};
		}
		else {
			if (!!incrementer) {
				mathsMap[type].incrementer += incrementer;
			}
			if (!!multiplier && level > mathsMap[type].maxLevel) {
				mathsMap[type].multiplier = multiplier;  // multiplier always the same for any type
				mathsMap[type].maxLevel = level;  // for calculation, level only applies to multipliers
			}
		}
	});
	return Object.entries(mathsMap)
		.reduce(
			(runningTotal, [, {incrementer, multiplier, maxLevel}]) => runningTotal + (incrementer * Math.pow(multiplier, maxLevel)),
			0
		);
};

const isUpgradeAcquired = (acquiredUpgrades, upgradeToFind) => {
	// acquired upgrades will be a list of ids from gameState
	return acquiredUpgrades.findIndex(upgradeId => upgradeId === upgradeToFind.id) >= 0;
};

const isUpgradeAvailable = (acquiredUpgrades, upgradeToCheck) => {
	if (isUpgradeAcquired(acquiredUpgrades, upgradeToCheck)) {
		// if you already have it, it's not available...
		return false;
	}
	if (upgradeToCheck.hasOwnProperty('upgradeDependencies')) {
		return upgradeToCheck.upgradeDependencies.reduce((isVisible, dependencyId) => {
			return isVisible && isUpgradeAcquired(acquiredUpgrades, {id: dependencyId});
		}, true);
	}
	else {
		return true;
	}
};

export const getAvailableUpgradesForDisplay = (gameState) => {
	// get the acquired upgrades off the game state. this will include worker unlocks
	const acquiredUpgrades = gameState.upgrades;
	// TODO: make for kennel too

	// make an array -> [{categoryName: '', upgrades: [...]}, ...]
	const upgradesToReturn = [];
	// 1. go through factory part upgrades
	// for each key in the upgrades map (a part)
	for (const [partType, {unlock, quantity, quality}] of Object.entries(factoryPartUpgrades)) {
		let upgradesToAdd = [];
		// check if unlock is acquired
		if (isUpgradeAcquired(acquiredUpgrades, unlock)) {
			// if acquired, check quantity & quality upgrades for visibility
			upgradesToAdd = upgradesToAdd.concat(quantity.filter(upgrade => isUpgradeAvailable(acquiredUpgrades, upgrade)).map(upgrade => {
				return {
					id: upgrade.id,
					cost: upgrade.cost,
					name: getQuantityName(partType, upgrade.level),
					description: getQuantityDesc(partType, unlock.incrementer, upgrade.level)
				};
			}));
			upgradesToAdd = upgradesToAdd.concat(quality.filter(upgrade => isUpgradeAvailable(acquiredUpgrades, upgrade)).map(upgrade => {
				return {
					id: upgrade.id,
					cost: upgrade.cost,
					name: getQualityName(partType, upgrade.level),
					description: getQualityDesc(partType, unlock.incrementer, upgrade.level)
				};
			}));
		}
		else {
			// if not acquired, check if available
			if (isUpgradeAvailable(acquiredUpgrades, unlock)) {
				// if available, add to map
				upgradesToAdd.push({
					id: unlock.id,
					cost: unlock.cost,
					name: getBaseName(partType),
					description: getBaseDesc(partType, unlock.incrementer)
				});
			}
		}
		// if any upgrades are being added
		if (upgradesToAdd.length > 0) {
			// add these all to the available upgrades map under the right part
			// add section metadata (just plural name) with list of upgrades -> categoryName: '', upgrades: [...]
			upgradesToReturn.push({
				categoryName: getBaseName(partType),
				upgrades: upgradesToAdd
			});
		}
	}

	return upgradesToReturn;
};

export const getFactoryDefault = () => getDefaultFactoryUpgrades();
