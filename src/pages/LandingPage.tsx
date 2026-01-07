import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    ArrowRight,
    BrainCircuit,
    Scale,
    CheckCircle2,
    Activity
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-50 via-slate-50 to-white"></div>

                <div className="container mx-auto px-6 lg:px-12">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={stagger}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider mb-8">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                            v2.4 Clinical Release
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight text-slate-900">
                            Fairness-First AI for <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Clinical Excellence</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                            EquiHealth acts as a safety layer regarding AI diagnostics. We quantify uncertainty and mitigate bias in real-time, holding algorithms accountable to every patient.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/app')}
                                className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-xl shadow-teal-600/20 transition-all flex items-center justify-center gap-2 group hover:scale-105 active:scale-95"
                            >
                                Launch Clinical Dashboard
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 transition-all hover:scale-105 active:scale-95">
                                View Validation Study
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: BrainCircuit,
                                title: "Uncertainty Quantification",
                                desc: "Our Quasi-Probabilistic Neural Network estimates \"epistemic uncertainty\" to detect when the model lacks sufficient knowledge to make a safe prediction.",
                                color: "indigo"
                            },
                            {
                                icon: ShieldCheck,
                                title: "Selective Deferral",
                                desc: "When uncertainty is high, the system automatically defers judgment to a human clinician, ensuring AI never makes a guess it can't justify.",
                                color: "emerald"
                            },
                            {
                                icon: Scale,
                                title: "Fairness Constraints",
                                desc: "Real-time monitoring of calibration error gaps across 16 demographic subgroups prevents algorithmic bias from affecting patient outcomes.",
                                color: "purple"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group duration-300"
                            >
                                <div className={`w-14 h-14 bg-${feature.color}-50 rounded-2xl flex items-center justify-center text-${feature.color}-600 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-800">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 border-t border-slate-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="md:w-1/2"
                        >
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Proven to Reduce Disparities</h2>
                            <p className="text-lg text-slate-500 leading-relaxed mb-8">
                                In validation studies, EquiHealth reduced false negative rates for underrepresented demographic groups by 42% compared to standard black-box diagnostic models.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Zero "Silent Failures" in testing',
                                    'Compliant with 2024 AI Safety Guidelines',
                                    'Seamless Integration with EHR Systems'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-teal-600" />
                                        <span className="font-semibold text-slate-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="md:w-1/2 flex justify-center"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900 text-white p-8 rounded-3xl text-center shadow-2xl shadow-slate-900/20">
                                    <div className="text-4xl font-bold mb-2">99.8%</div>
                                    <div className="text-slate-400 text-sm font-semibold uppercase">Safety Score</div>
                                </div>
                                <div className="bg-teal-600 text-white p-8 rounded-3xl text-center translate-y-8 shadow-2xl shadow-teal-600/30">
                                    <div className="text-4xl font-bold mb-2">0.02</div>
                                    <div className="text-teal-200 text-sm font-semibold uppercase">Max ECE Gap</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12">
                <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Activity className="w-6 h-6 text-teal-500" />
                        <span className="text-lg font-bold">EquiHealth</span>
                    </div>
                    <div className="text-slate-400 text-sm">
                        © 2024 EquiHealth Clinical Systems. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
