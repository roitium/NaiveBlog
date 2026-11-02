import { createContext, useContext } from 'react'
import type { CategoryTreeNode } from '@/services/content/metaGen'
export type NavigationData = {
	pathname: string
	categoryData: CategoryTreeNode
	tagData: Record<string, number>
}
export const NavigationContext = createContext<NavigationData | null>(null)
export function useNavigationData() {
	const value = useContext(NavigationContext)
	if (!value)
		throw new Error('Navigation components must be inside NavigationIsland')
	return value
}
