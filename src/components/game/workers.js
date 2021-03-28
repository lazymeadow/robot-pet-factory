import {canSeeWorkers} from './upgrades';


const intervalIds = [];
export const updateIntervals = (state, incrementHandler) => {
	// first clean up all the existing intervals
	intervalIds.forEach(intervalId => window.clearInterval(intervalId));
	intervalIds.splice(0);
	// then go make new intervals for the items that already exist.
	// map the intervals by duration
	const intervalMap = {};
	state.workers.forEach(worker => {
		if (!intervalMap.hasOwnProperty(worker.duration)) {
			intervalMap[worker.duration] = [];
		}
		intervalMap[worker.duration].push(worker);
	});
	for (const [duration, values] of Object.entries(intervalMap)) {
		intervalIds.push(
			window.setInterval(() => {
					incrementHandler(values.reduce((acc, value) => acc + (value.clickQuantity * value.count), 0));
				},
				duration
			)
		);
	}
};

class Worker {
	static workerCount = 0;

	constructor (name, description, duration, clickQuantity, cost) {
		this.id = (Worker.workerCount++).toString().padStart(8, '0');
		this.name = name;
		this.description = description;
		this.duration = duration;
		this.clickQuantity = clickQuantity;
		this.cost = cost;
		this.count = 0;
		this.addWorker = () => this.count++;
	}

	isVisible = (state) => canSeeWorkers(state);
}

const worker1 = new Worker(
	'Mouse Droid',
	'They don\'t do much, but the can make wires. How? You don\'t wanna know.',
	3000,
	1,
	25
);

export const getWorkerById = (type, id) => unlockableWorkers[type].find(worker => worker.id === id);

export const unlockableWorkers = {
	factory: [
		worker1
	]
};

export const loadWorkers = (type, workerMap) => {
	const workers = unlockableWorkers[type].filter(worker => Object.keys(workerMap).includes(worker.id));
	workers.forEach(worker => worker.count = workerMap[worker.id]);
	return workers;
};