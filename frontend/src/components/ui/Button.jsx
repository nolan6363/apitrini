import React from 'react';

function Button({ 
    children, 
    variant = 'primary', 
    size = 'medium',
    disabled = false,
    onClick,
    type = 'button',
    className = '',
}) {
    // Cette fonction définit les styles de base et les variantes
    const getStyles = () => {
        // Styles de base communs à tous les boutons
        const baseStyles = 'font-medium rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
        
        // Styles spécifiques pour chaque variante
        const variants = {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
            secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
            danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
        };
        
        // Styles pour différentes tailles
        const sizes = {
            small: 'px-3 py-1.5 text-sm',
            medium: 'px-4 py-2 text-base',
            large: 'px-6 py-3 text-lg',
        };
        
        // Styles pour l'état désactivé
        const disabledStyles = disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer';
        
        return `${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`;
    };

    return (
        <button
            type={type}
            className={getStyles()}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default Button;