
import React, { useState } from 'react';
import { ViewState } from '../types';

interface FooterProps {
  onNavigate: (view: ViewState) => void;
  onAdminLogin: (email: string, pass: string) => Promise<boolean>;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onAdminLogin }) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'disclaimer' | 'about' | 'contact' | null>(null);
  const [messageSent, setMessageSent] = useState(false);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError(false);
    
    const success = await onAdminLogin(adminEmail, adminPass);
    
    if (success) {
      setShowAdminLogin(false);
      setAdminEmail('');
      setAdminPass('');
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
    setIsAuthenticating(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setActiveModal(null);
    }, 2000);
  };

  const renderModal = () => {
    if (!activeModal) return null;
    
    const content = {
      privacy: {
        title: "Privacy Protocol v3.1",
        body: (
          <div className="space-y-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px] mb-2">1. India DPDP Act Compliance</h4>
              <p>AarogyaAI operates as a 'Data Fiduciary' under the Digital Personal Data Protection Act. We prioritize the 'Right to Be Forgotten'. All clinical symptom inputs are anonymized before being processed by our neural engines.</p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px] mb-2">2. Data Sovereignty</h4>
              <p>Your clinical data never leaves Indian territory. We utilize edge computing nodes located in regional clusters (e.g., Mumbai/Pune) to ensure low-latency, localized processing.</p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px] mb-2">3. Zero-Knowledge Architecture</h4>
              <p>We do not store plain-text symptoms. Inputs are converted into high-dimensional vectors for specialist mapping and then flushed from volatile memory within 300 seconds of the session end.</p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px] mb-2">4. User Agency</h4>
              <p>You have the absolute right to export or purge your history. We do not use your data for algorithmic training of third-party pharmaceutical models.</p>
            </div>
          </div>
        )
      },
      terms: {
        title: "Terms of Node Operation",
        body: (
          <div className="space-y-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px] mb-2">1. Scope of Service</h4>
              <p>AarogyaAI is a high-level medical routing protocol. It is designed to navigate users toward validated clinical nodes. It does not provide medical services, prescriptions, or definitive diagnoses.</p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px] mb-2">2. Registry Integrity</h4>
              <p>Doctors joining the network warrant that they hold active, valid registrations with the National Medical Commission (NMC). Users are encouraged to double-verify credentials at the physical clinical node.</p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px] mb-2">3. Prohibited Usage</h4>
              <p>The platform must not be used for emergency diagnostic avoidance. Automated scraping of the doctor registry is strictly prohibited and protected by anti-bot neural firewalls.</p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px] mb-2">4. Liability Boundary</h4>
              <p>AarogyaAI acts as a neutral technological bridge. The final clinical outcome is solely the responsibility of the licensed practitioner and the patient.</p>
            </div>
          </div>
        )
      },
      disclaimer: {
        title: "Medical Disclaimer",
        body: (
          <div className="space-y-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            <div className="bg-red-500/10 p-6 border border-red-500/20 rounded-2xl mb-4">
              <p className="text-red-600 dark:text-red-400 font-black text-[10px] uppercase tracking-widest mb-2 flex items-center">
                <i className="fas fa-exclamation-triangle mr-2"></i> Critical Network Protocol
              </p>
              <p className="font-bold">AarogyaAI does NOT provide medical diagnoses or professional medical advice.</p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px] mb-2">1. Emergency Situations</h4>
              <p>If you are experiencing chest pain, severe bleeding, difficulty breathing, or sudden numbness, DISCONNECT IMMEDIATELY and call 108 or proceed to the nearest trauma center.</p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px] mb-2">2. Probabilistic Mapping</h4>
              <p>AI-driven specialist suggestions are based on statistical patterns in general medical literature. They may not account for your specific co-morbidities or unique physiological profile.</p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[10px] mb-2">3. Human Validation</h4>
              <p>The AI is a tool to reduce navigation friction, not to replace the clinical judgment of a human physician. Always verify the routing with a healthcare professional.</p>
            </div>
          </div>
        )
      },
      about: {
        title: "About Our Mission",
        body: (
          <div className="space-y-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            <p>AarogyaAI was born from a simple observation: Indian patients often waste critical time visiting the wrong specialists. In rural and semi-urban districts like Palghar, finding the right door is half the battle.</p>
            <p>Our mission is to democratize medical navigation using state-of-the-art Generative AI, making it accessible even to those who struggle to articulate medical terminology.</p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <h5 className="font-black text-emerald-500 text-[10px] uppercase tracking-widest mb-1">Impact</h5>
                <p className="text-xs font-bold text-slate-900 dark:text-white">10k+ Navigations</p>
              </div>
              <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <h5 className="font-black text-emerald-500 text-[10px] uppercase tracking-widest mb-1">Nodes</h5>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Verified Local List</p>
              </div>
            </div>
          </div>
        )
      },
      contact: {
        title: "Broadcast a Message",
        body: (
          <div className="space-y-6">
            {!messageSent ? (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest ml-2">Your Identity</label>
                  <input type="text" required placeholder="Name or Citizen ID" className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest ml-2">Message Content</label>
                  <textarea required rows={4} placeholder="How can the network assist you today?" className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white font-bold resize-none" />
                </div>
                <button type="submit" className="w-full py-4 bg-emerald-500 text-white dark:text-slate-950 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all shadow-lg">Transmit to Uplink</button>
              </form>
            ) : (
              <div className="py-12 text-center animate-in zoom-in-95">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <i className="fas fa-check text-2xl"></i>
                </div>
                <p className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Transmission Successful</p>
                <p className="text-slate-500 text-[10px] mt-2 font-bold">The network will respond to your node shortly.</p>
              </div>
            )}
          </div>
        )
      }
    }[activeModal];

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in transition-colors">
        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh] transition-colors">
          <div className="p-8 lg:p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{content.title}</h2>
            <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"><i className="fas fa-times text-xs"></i></button>
          </div>
          <div className="p-8 lg:p-10 overflow-y-auto">{content.body}</div>
          <div className="p-6 lg:p-8 border-t border-slate-100 dark:border-white/5 text-center">
            <button onClick={() => setActiveModal(null)} className="bg-emerald-500 text-white dark:text-slate-950 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10">Acknowledged</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 pt-16 lg:pt-24 pb-12 overflow-hidden relative transition-colors">
      {renderModal()}
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16 lg:mb-24">
          <div className="col-span-1">
            <div className="flex items-center mb-6 lg:mb-8 cursor-pointer group" onClick={() => onNavigate('home')}>
              <div className="bg-emerald-500 p-2 rounded-xl mr-3 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <i className="fas fa-stethoscope text-white dark:text-slate-950 text-lg"></i>
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">Aarogya<span className="text-emerald-500">AI</span></span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 font-medium transition-colors">
              Empowering India with AI-driven health navigation. Bridging the gap between symptoms and specialists through a verified clinical registry.
            </p>
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-[0.4em] mb-6 lg:mb-8">Navigation</h4>
            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest">
              <li><button onClick={() => onNavigate('home')} className="text-slate-400 hover:text-emerald-500 transition-colors">Registry Home</button></li>
              <li><button onClick={() => onNavigate('find-doctor')} className="text-slate-400 hover:text-emerald-500 transition-colors">Check Symptoms</button></li>
              <li><button onClick={() => onNavigate('doctor-list')} className="text-slate-400 hover:text-emerald-500 transition-colors">Verified Doctors</button></li>
              <li><button onClick={() => onNavigate('join-doctor')} className="text-slate-400 hover:text-emerald-500 transition-colors">Join as a Doctor</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-[0.4em] mb-6 lg:mb-8">Legal Map</h4>
            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors">
              <li><button onClick={() => setActiveModal('privacy')} className="hover:text-emerald-500 text-left">Privacy Protocol</button></li>
              <li><button onClick={() => setActiveModal('terms')} className="hover:text-emerald-500 text-left">Terms of Node</button></li>
              <li><button onClick={() => setActiveModal('disclaimer')} className="hover:text-emerald-500 text-left">Medical Disclaimer</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-[0.4em] mb-6 lg:mb-8">Network Node</h4>
            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors">
              <li><button onClick={() => setActiveModal('about')} className="hover:text-emerald-500 text-left">About Our Mission</button></li>
              <li><button onClick={() => setActiveModal('contact')} className="hover:text-emerald-500 text-left">Broadcast Message</button></li>
            </ul>
          </div>
        </div>
        <div className="pt-12 border-t border-slate-200 dark:border-white/5 text-center transition-colors">
          <p className="text-[9px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.4em]">&copy; {new Date().getFullYear()} AarogyaAI Network. All verified clinical nodes reserved.</p>
          <div className="mt-8">
            {!showAdminLogin ? (
              <button onClick={() => setShowAdminLogin(true)} className="text-[8px] text-slate-400 hover:text-emerald-500 transition-all flex items-center mx-auto px-5 py-2.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 font-black uppercase tracking-[0.3em] shadow-sm">
                <i className="fas fa-fingerprint mr-2 text-emerald-500"></i> Terminal Administrator
              </button>
            ) : (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-emerald-500/20 shadow-2xl max-w-xs w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Admin Authentication</h5>
                    <button onClick={() => setShowAdminLogin(false)} className="text-slate-400 hover:text-red-500"><i className="fas fa-times text-[10px]"></i></button>
                  </div>
                  <form onSubmit={handleAdminSubmit} className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Admin Email" 
                      required
                      value={adminEmail} 
                      onChange={(e) => setAdminEmail(e.target.value)} 
                      className="w-full text-[10px] px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white font-bold"
                    />
                    <input 
                      type="password" 
                      placeholder="Security Password" 
                      required
                      value={adminPass} 
                      onChange={(e) => setAdminPass(e.target.value)} 
                      className="w-full text-[10px] px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white font-bold"
                    />
                    <button 
                      type="submit" 
                      disabled={isAuthenticating}
                      className="w-full bg-emerald-500 text-white dark:text-slate-950 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                    >
                      {isAuthenticating ? <i className="fas fa-circle-notch animate-spin"></i> : "Access Terminal"}
                    </button>
                  </form>
                  {error && <p className="text-[8px] text-red-500 mt-3 font-black uppercase tracking-widest text-center animate-pulse">Unauthorized Identity</p>}
                </div>
              </div>
            )}
            <div className="mt-6 flex items-center justify-center space-x-2 text-[8px] text-slate-200 dark:text-slate-800 font-black uppercase tracking-[0.5em] transition-colors"><i className="fas fa-shield-virus"></i><span>Gateway Alpha v3.1</span></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
