import {createContext, useState} from 'react';


const TabContext = createContext();

function Tabs ({children}) {
	const [currentTab, setCurrentTab] = useState(0);
	return (
		<TabContext.Provider value={{
			currentTab,
			setCurrentTab,
			isCurrentTab: (tabKey) => currentTab === tabKey
		}}>
			{children}
		</TabContext.Provider>
	);
}

function TabsContainer ({children}) {
	return (
		<div className={'tabs-container'}>
			{children}
		</div>
	);
}

function Tab ({children, tabKey}) {
	return (
		<TabContext.Consumer>
			{({isCurrentTab, setCurrentTab}) => (
				<div className={`tab${isCurrentTab(tabKey) ? ' current' : ''}`}
					 role={'button'}
					 onClick={isCurrentTab(tabKey) ? null : () => setCurrentTab(tabKey)}
				>
					{children}
				</div>
			)}
		</TabContext.Consumer>
	);
}

function TabContent ({children, tabKey}) {
	return (
		<TabContext.Consumer>
			{({isCurrentTab}) => isCurrentTab(tabKey) && (
				<div className={'tab-content'}>
					{children}
				</div>
			)}
		</TabContext.Consumer>
	);
}

export {TabsContainer, Tab, Tabs, TabContent};