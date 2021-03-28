import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


ReactDOM.render(
	// StringMode is making the game reducer double worker count due todouble invocation of the reducer. this is likely
	// a big problem but i don't want to deal with it.
	// <React.StrictMode>
	<App/>,
	// </React.StrictMode>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
