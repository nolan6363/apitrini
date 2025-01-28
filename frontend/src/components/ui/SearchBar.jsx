import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

function SearchBar({ onSearch, onSort }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('name');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch?.(value);
    };

    const handleSortChange = (option) => {
        setSortOption(option);
        onSort?.(option);
        setIsDropdownOpen(false);
    };

    const sortOptions = [
        { value: 'name', label: 'Nom' },
        { value: 'date', label: 'Date' },
        { value: 'location', label: 'Emplacement' }
    ];

    return (
        <div className="flex gap-2 p-2">
            {/* Barre de recherche */}
            <div className="relative flex-grow">
                <input
                    type="text"
                    placeholder="Filtrer les ruchers..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full h-10 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-3 text-gray-400" size={20} />
            </div>

            {/* Menu déroulant de tri */}
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="h-10 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2"
                >
                    <span>Trier par</span>
                    <ChevronDown size={16} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSortChange(option.value)}
                                className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${
                                    sortOption === option.value ? 'bg-blue-50 text-blue-600' : ''
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchBar;