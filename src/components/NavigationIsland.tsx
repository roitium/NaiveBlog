import { KBarSearchProvider } from './kbar/KbarSearch'
import FloatNavBar from './navBar/main'
import { NavigationContext, type NavigationData } from './navBar/context'
export default function NavigationIsland(props: NavigationData) {
	return (
		<NavigationContext.Provider value={props}>
			<KBarSearchProvider>
				<FloatNavBar />
			</KBarSearchProvider>
		</NavigationContext.Provider>
	)
}
