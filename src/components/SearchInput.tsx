import { SearchBar } from 'antd-mobile'
import { SearchOutline } from 'antd-mobile-icons'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useSearch } from '../hooks/useSearch'
import { useAppStore } from '../store/useAppStore'

export function SearchInput(): ReactNode {
	const searchLoading = useAppStore((state) => state.searchLoading)
	const searchText = useAppStore((state) => state.searchText)

	const search = useSearch()
	const navigate = useNavigate()

	const handleSearch = (searchText: string): void => {
		search.run(searchText)
		navigate('/search')
	}

	return (
		<SearchBar
			className={searchLoading ? 'pointer-events-none opacity-50' : ''}
			maxLength={80}
			defaultValue={searchText}
			searchIcon={<SearchOutline fontSize={20} />}
			placeholder="Tìm kiếm..."
			onSearch={handleSearch}
		/>
	)
}
