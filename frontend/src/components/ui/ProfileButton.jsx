import React from 'react';

function ProfileButton({ isLoggedIn, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
            </svg>
            <span>{isLoggedIn ? 'Mon Profil' : 'Se connecter'}</span>
        </button>
    );
}

export default ProfileButton;