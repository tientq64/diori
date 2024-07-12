import { SearchBar } from 'antd-mobile'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useSearch } from '../../hooks/useSearch'

export function SearchInput(): ReactNode {
	const store = useStore()
	const search = useSearch()
	const navigate = useNavigate()

	const handleSearch = (searchText: string): void => {
		search.run(searchText)
		navigate('/search')
	}

	return (
		<SearchBar
			className={store.searchLoading ? 'pointer-events-none opacity-50' : ''}
			maxLength={80}
			defaultValue={store.searchText}
			placeholder="Tìm kiếm..."
			onSearch={handleSearch}
		/>
	)
}
