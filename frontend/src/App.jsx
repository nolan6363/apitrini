import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {AuthProvider} from '@/contexts/AuthContext';
import HomeBar from "@/components/ui/HomeBar";
import Login from "@/pages/Login";
import VarroaScanner from "@/components/varroa_scanner/VarroaScanner";
import Register from "@/pages/Register";
import CheckAuth from "@/components/features/auth/CheckAuth";

// Pages temporaires
const Home = () => <div className="p-4">Page d'accueil</div>;
const RucheManagement = () => <div className="p-4">Gestion des Ruches</div>;
const Stats = () => <div className="p-4">Statistiques</div>;
const Resources = () => <div className="p-4">Ressources</div>;

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <HomeBar/>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/ruches" element={<RucheManagement/>}/>
                        <Route path="/varroa" element={<VarroaScanner/>}/>
                        <Route path="/statistiques" element={<Stats/>}/>
                        <Route path="/ressources" element={<Resources/>}/>
                        <Route path="/register" element={<Register/>}/>
                    </Routes>
                    <CheckAuth/>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;