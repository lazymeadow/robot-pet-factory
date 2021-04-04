import {getBaseName, getSingularName, partTypes} from '../upgrades/data';


const types = {
	worker1: 'WORKER_1',
	worker2: 'WORKER_2'
};

const typeNames = {
	[types.worker1]: {
		singular: 'mouse droid',
		plural: 'mouse droids'
	},
	[types.worker2]: {
		singular: 'twisty bot',
		plural: 'twisty bots'
	}
};

export const getWorkerName = (type) => typeNames[type].plural.charAt(0).toUpperCase() + typeNames[type].plural.slice(1, typeNames[type].plural.length);
export const getWorkerDesc = (type) => {
	const worker = factoryWorkers[type];
	return `${getWorkerName(type)} create ${worker.incrementer} ${worker.incrementer > 1 ? getBaseName(worker.makes) : getSingularName(worker.makes)} every ${worker.interval} seconds.`;
};


export const factoryWorkers = {
	[types.worker1]: {
		id: 'worker_0',
		makes: partTypes.part1,
		cost: 25,
		incrementer: 1,
		interval: 3,
		workerDependencies: [
			'f_1'
		]
	},
	[types.worker2]: {
		id: 'worker_1',
		makes: partTypes.part2,
		cost: 75,
		incrementer: 2,
		interval: 5,
		workerDependencies: [
			's_quant_0',
			's_qual_0'
		]
	}
};
