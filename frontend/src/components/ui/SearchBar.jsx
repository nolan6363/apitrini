import React from "react";

function SearchBar() {
    return (
        <>
            <div className="flex">
                <div className="w-96 h-8 m-1 bg-red-500">
                    Filtrer les ruchers...
                </div>
                <div className="w-32 h-8 m-1 bg-red-500">
                    Trier par...
                </div>
            </div>
        </>
    );
}

export default SearchBar;