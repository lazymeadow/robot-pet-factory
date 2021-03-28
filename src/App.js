import './App.scss';
import {createContext, useState} from 'react';
import Overview from './components/overview/Overview';
import Factory from './components/factory/Factory';
import Kennel from './components/kennel/Kennel';
import {GameWrapper} from './components/game/GameWrapper';
import Header from './components/Header';


const views = {
	overview: 'OVERVIEW',
	factory: 'FACTORY',
	kennel: 'KENNEL'
};

export const ViewContext = createContext();

function App () {
	const [currentView, setCurrentView] = useState(views.overview);

	let viewContent;

	if (currentView === views.factory) {
		viewContent = <Factory/>;
	}
	else if (currentView === views.kennel) {
		viewContent = <Kennel/>;
	}
	else {  // views.overview
		viewContent = <Overview/>;
	}

	return (
		<ViewContext.Provider value={{
			showOverview: () => setCurrentView(views.overview),
			showFactory: () => setCurrentView(views.factory),
			showKennel: () => setCurrentView(views.kennel),
			isCurrentViewOverview: () => currentView === views.overview,
			isCurrentViewFactory: () => currentView === views.factory,
			isCurrentViewKennel: () => currentView === views.kennel
		}}>
			<GameWrapper>
				<div className="dashboard">
					<Header/>
					{viewContent}
				</div>
			</GameWrapper>
		</ViewContext.Provider>
	);

}

export default App;
