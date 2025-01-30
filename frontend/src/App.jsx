import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {AuthProvider} from '@/contexts/AuthContext';
import HomeBar from "@/components/ui/HomeBar.jsx";
import Login from "@/pages/auth/Login.jsx";
import VarroaScanner from "@/pages/VarroaScanner.jsx";
import Register from "@/pages/auth/Register.jsx";
import ApiaryList from "@/pages/apiary/ApiaryList.jsx";
import CheckAuth from "@/components/features/auth/CheckAuth";
import Apiary from "@/pages/hives/Apiary.jsx";
import CreateApiary from "@/pages/apiary/CreateApiary.jsx";
import CreateHive from "@/pages/hives/CreateHive.jsx";
import Hive from "@/pages/hives/Hive.jsx";

// Pages temporaires
const Home = () => <div className="p-4">Page d'accueil</div>;
const Stats = () => <div className="p-4">Statistiques</div>;
const Resources = () => <div className="p-4">Ressources</div>;

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-200">
                    <HomeBar/>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/apiaries" element={<ApiaryList/>}/>
                        <Route path="/varroa" element={<VarroaScanner/>}/>
                        <Route path="/varroa/:hiveId" element={<VarroaScanner/>}/>
                        <Route path="/statistics" element={<Stats/>}/>
                        <Route path="/ressources" element={<Resources/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/apiary/:apiaryId/add/" element={<CreateHive />}/>
                        <Route path="/apiary/:apiaryId" element={<Apiary />} />
                        <Route path="/hive/:hiveId" element={<Hive />} />
                        <Route path="/apiaries/add" element={<CreateApiary />} />
                    </Routes>
                    {/*<CheckAuth/>*/}
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;