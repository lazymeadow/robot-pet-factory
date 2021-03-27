export default function TwoPanel ({tabsContent, mainContent}) {
	return (
		<div className="two-panel">
			<div className="tabs-panel">
				{tabsContent}
			</div>
			<div className="main-panel">
				{mainContent}
			</div>
		</div>
	);
}