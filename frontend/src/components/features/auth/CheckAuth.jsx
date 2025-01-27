import React, {useState} from "react"
import {useAuth} from '@/contexts/AuthContext';

function CheckAuth() {
    const {fetchUserData} = useAuth();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheck = async () => {

        setIsLoading(true);
        setUserData(null);
        const token = localStorage.getItem('token');
        if (token) {
            const data = await fetchUserData(token);
            setUserData(data);
        }
        setIsLoading(false);
    };

    return (
        <div>
            <button
                onClick={handleCheck}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {isLoading ? "Vérification..." : "Vérifier l'authentification"}
            </button>

            <div className="mt-4">
                {userData ? (
                    <pre className="bg-gray-100 p-4 rounded">
                            {JSON.stringify(userData, null, 2)}
                        </pre>
                ) : (
                    <p className="text-red-500">Utilisateur non connecté</p>
                )}
            </div>
        </div>
    );
}

export default CheckAuth;