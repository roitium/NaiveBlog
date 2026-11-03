import { useKBar } from 'kbar'
import { SearchIcon } from 'lucide-react'
import { memo } from 'react'

const SearchButton = memo(() => {
	const { query } = useKBar()
	return (
		<button
			onClick={() => query.toggle()}
			aria-label='Search'
		>
			<SearchIcon className='size-4' />
		</button>
	)
})

SearchButton.displayName = 'SearchButton'

export default SearchButton
