
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const Navbar: React.FC = () => {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="container mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold text-slate-900">EquiHealth</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <button className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Platform</button>
                    <button className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Research</button>
                    <button className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">About Us</button>
                </div>

                <button
                    onClick={() => navigate('/app')}
                    className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                    Launch App
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
