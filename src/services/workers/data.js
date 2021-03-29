
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

export const getWorkerDesc = (type) => `Unlock ${typeNames[type].plural}`;

export const factoryWorkers = {
	[types.worker1]: {
		unlock: {
			id: 'worker_unlock_0',
			cost: 500,
			upgradeDependencies: [
				'w_quant_0',
				'w_qual_0'
			]
		},
		worker: {
			id: 'worker_0',
			cost: 25,
			incrementer: 1
		}
	},
	[types.worker2]: {
		unlock: {
			id: 'worker_unlock_1',
			cost: 500,
			upgradeDependencies: [
				's_quant_0',
				's_qual_0'
			]
		},
		worker: {
			id: 'worker_1',
			cost: 75,
			incrementer: 2
		}
	}
}
