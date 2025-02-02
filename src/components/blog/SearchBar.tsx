import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import debounce from 'lodash/debounce';

const SearchBar = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    // Initialize search term from URL
    useEffect(() => {
        const { search } = router.query;
        if (search && typeof search === 'string') {
            setSearchTerm(search);
        }
    }, [router.query]);

    // Debounced search function
    const debouncedSearch = debounce((term: string) => {
        const currentQuery = { ...router.query };

        if (term) {
            currentQuery.search = term;
        } else {
            delete currentQuery.search;
        }

        // Reset to first page when searching
        delete currentQuery.page;

        router.push({
            pathname: router.pathname,
            query: currentQuery,
        }).then(() => {});
    }, 500);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        debouncedSearch(term);
    };

    return (
        <div className="relative max-w-md mx-auto mb-8">
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search posts..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         placeholder-gray-400"
                aria-label="Search posts"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>
        </div>
    );
};

export default SearchBar;