import {factoryWorkers, getWorkerDesc, getWorkerName} from './data';
import {getAcquiredFactoryLevelUpgradeIds, getAllAcquiredUpgrades, isUpgradeAcquired} from '../upgrades/service';


export const findWorkerByType = (type) => {
	return factoryWorkers[type];
};

export const isWorkerTypeUnlocked = (acquiredUpgrades, type) => {
	const worker = findWorkerByType(type);
	if (!worker) {
		return false;
	}
	return worker.workerDependencies.reduce((acc, currDep) => acc && isUpgradeAcquired(acquiredUpgrades, type))
	const workerAcquired = worker.workerDependencies.reduce((acc, currDep) => acc && isUpgradeAcquired(acquiredUpgrades, {id: currDep}), true);
	return workerAcquired;
}

export const getAvailableWorkersForDisplay = (gameState) => {
	// add the factory level upgrades to the acquired upgrades list for checking
	const allAcquiredUpgrades = getAllAcquiredUpgrades(gameState);

	const workersToReturn = [];
	for (const [workerType, {id, cost, workerDependencies}] of Object.entries(factoryWorkers)) {
		let shouldAddWorker = workerDependencies.reduce((acc, currDep) => acc && isUpgradeAcquired(allAcquiredUpgrades, {id: currDep}), true);
		// let shouldAddWorker = true;
		// for (const dependencyId of workerDependencies) {
		// 	// if any upgrade is false, we should not add it.
		// 	shouldAddWorker = shouldAddWorker && isUpgradeAcquired(allAcquiredUpgrades, {id: dependencyId});
		// }
		if (shouldAddWorker) {
			workersToReturn.push({
				id,
				cost,
				count: gameState.workers.hasOwnProperty(workerType) ? gameState.workers[workerType] : 0,
				name: getWorkerName(workerType),
				description: getWorkerDesc(workerType),
				type: workerType
			});
		}
	}
	return workersToReturn;
};