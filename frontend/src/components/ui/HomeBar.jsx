import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import NavLink from '@/components/ui/NavLink.jsx';

function HomeBar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleAuthClick = () => {
        if (user) {
            logout();
        } else {
            navigate('/login');
        }
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo et nom du site */}
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-gray-900">ApiTrini</span>
                        </Link>
                    </div>

                    {/* Navigation principale */}
                    <nav className="hidden md:flex items-center space-x-4">
                        <NavLink to="/" >
                            Accueil
                        </NavLink>
                        <NavLink to="/apiaries">
                            Mes Ruches
                        </NavLink>
                        <NavLink to="/varroa">
                            Comptage Varroas
                        </NavLink>
                        <NavLink to="/statistics">
                            Mes analyses
                        </NavLink>
                        <NavLink to="/ressources">
                            Ressources
                        </NavLink>
                    </nav>

                    {/* Bouton de connexion */}
                    <div className="flex items-center">
                        <button
                            onClick={handleAuthClick}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            {user ? 'Se déconnecter' : 'Se connecter'}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default HomeBar;