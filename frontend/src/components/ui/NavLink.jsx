import React from 'react';
import { Link } from 'react-router-dom';

function NavLink({ to, children }) {
    return (
        <Link
            to={to}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
            {children}
        </Link>
    );
}

export default NavLink;