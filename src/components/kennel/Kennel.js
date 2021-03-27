import {ViewContext} from '../../App';
import TwoPanel from '../TwoPanel';


export default function Kennel () {
	const renderTabs = () => <h2>Kennel</h2>;

	const renderMain = () => "it's exciting";

	return (
		<ViewContext.Consumer>
			{() => (
				<TwoPanel tabsContent={renderTabs()} mainContent={renderMain()} />
			)}
		</ViewContext.Consumer>
	);
}