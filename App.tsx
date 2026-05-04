
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import CustomerMenu from './pages/customer/Menu';
import CustomerCart from './pages/customer/Cart';
import CustomerPayment from './pages/customer/Payment';
import CustomerOrderTracking from './pages/customer/Tracking';
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerInventory from './pages/owner/Inventory';
import OwnerHistory from './pages/owner/History';
import { useStore } from './store';
import { CartItem } from './types';
import { BUSINESS_NAME, CONTACT_EMAIL, CONTACT_PHONE, APP_DESCRIPTION } from './constants';

const Navigation = ({ cartCount, isAuthenticated, onLogout }: { cartCount: number, isAuthenticated: boolean, onLogout: () => void }) => {
  const location = useLocation();
  const isOwnerPath = location.pathname.startsWith('/owner');

  const NavLink = ({ to, icon, label, activeColor }: { to: string, icon: string, label: string, activeColor: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex flex-col md:flex-row items-center md:space-x-2 px-3 py-2 rounded-xl transition-all ${isActive ? `${activeColor} font-bold` : 'text-gray-400 md:text-gray-500 hover:text-gray-900'}`}>
        <i className={`${icon} text-lg md:text-base`}></i>
        <span className="text-[9px] md:text-xs uppercase tracking-wider mt-1 md:mt-0">{label}</span>
      </Link>
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-[60] flex items-center justify-between px-4 md:px-8 shadow-sm">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${isOwnerPath ? 'bg-blue-600' : 'bg-orange-600'}`}>
            <i className={`fas ${isOwnerPath ? 'fa-store-alt' : 'fa-hamburger'}`}></i>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-gray-900 uppercase tracking-tighter text-sm md:text-lg leading-none">{BUSINESS_NAME}</span>
            <span className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Order Online • Pick Up Hot</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-3 rounded-full border border-gray-200 bg-white/90 px-4 py-2 shadow-sm hover:shadow-md transition-all">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <i className="fas fa-headset text-sm"></i>
          </span>
          <a href={`mailto:${CONTACT_EMAIL}`} className="flex flex-col text-left leading-tight hover:opacity-80 transition-opacity">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">Contact</span>
            <span className="text-xs font-bold text-gray-900">{CONTACT_EMAIL}</span>
          </a>
          <span className="h-8 w-px bg-gray-100" />
          <a href={`tel:${CONTACT_PHONE}`} className="text-xs font-black text-gray-900 hover:opacity-80 transition-opacity">
            {CONTACT_PHONE}
          </a>
        </div>

        <div className="hidden md:flex items-center space-x-1">
          {!isOwnerPath ? (
            <>
              <NavLink to="/" icon="fas fa-th-large" label="Menu" activeColor="bg-orange-50 text-orange-600" />
              <NavLink to="/cart" icon="fas fa-shopping-bag" label={`Cart (${cartCount})`} activeColor="bg-orange-50 text-orange-600" />
              <NavLink to="/orders" icon="fas fa-clock" label="Track" activeColor="bg-orange-50 text-orange-600" />
            </>
          ) : (
            <>
              <NavLink to="/owner" icon="fas fa-bolt" label="Dashboard" activeColor="bg-blue-50 text-blue-600" />
              <NavLink to="/owner/inventory" icon="fas fa-clipboard-list" label="Menu Editor" activeColor="bg-blue-50 text-blue-600" />
              <NavLink to="/owner/history" icon="fas fa-history" label="Sales" activeColor="bg-blue-50 text-blue-600" />
              <button onClick={onLogout} className="ml-4 px-4 py-2 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all">
                <i className="fas fa-power-off mr-2"></i> Lock
              </button>
            </>
          )}
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 z-[60] flex items-center justify-around px-2">
        {!isOwnerPath ? (
          <>
            <Link to="/" className={`flex flex-col items-center flex-1 py-1 ${location.pathname === '/' ? 'text-orange-600' : 'text-gray-300'}`}>
              <i className="fas fa-utensils text-lg"></i>
              <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">Home</span>
            </Link>
            <Link to="/cart" className={`flex flex-col items-center flex-1 py-1 relative ${location.pathname === '/cart' ? 'text-orange-600' : 'text-gray-300'}`}>
              <i className="fas fa-shopping-basket text-lg"></i>
              {cartCount > 0 && <span className="absolute top-1 right-1/4 bg-orange-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">{cartCount}</span>}
              <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">Cart</span>
            </Link>
            <Link to="/orders" className={`flex flex-col items-center flex-1 py-1 ${location.pathname === '/' ? '' : (location.pathname === '/orders' ? 'text-orange-600' : 'text-gray-300')}`}>
              <i className="fas fa-receipt text-lg"></i>
              <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">Orders</span>
            </Link>
          </>
        ) : (
          <>
            <Link to="/owner" className={`flex flex-col items-center flex-1 py-1 ${location.pathname === '/owner' ? 'text-blue-600' : 'text-gray-300'}`}>
              <i className="fas fa-chart-line text-lg"></i>
              <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">Live</span>
            </Link>
            <Link to="/owner/inventory" className={`flex flex-col items-center flex-1 py-1 ${location.pathname === '/owner/inventory' ? 'text-blue-600' : 'text-gray-300'}`}>
              <i className="fas fa-edit text-lg"></i>
              <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">Menu</span>
            </Link>
            <button onClick={onLogout} className="flex flex-col items-center flex-1 py-1 text-red-400">
               <i className="fas fa-lock text-lg"></i>
               <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">Lock</span>
            </button>
          </>
        )}
      </nav>

      <div className="md:hidden fixed bottom-16 left-3 right-3 z-[59]">
        <div className="rounded-2xl border border-orange-100 bg-white/95 backdrop-blur-md shadow-lg px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md">
              <i className="fas fa-envelope-open-text"></i>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">Contact DREAMCRAFTER</p>
              <p className="text-[10px] font-bold text-gray-700 truncate">{CONTACT_EMAIL}</p>
            </div>
          </div>
          <a href={`tel:${CONTACT_PHONE}`} className="shrink-0 rounded-full bg-gray-900 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white">
            {CONTACT_PHONE}
          </a>
        </div>
      </div>
    </>
  );
};

const OwnerLogin = ({ onLogin, storedPin, recoveryPhone, securityQuestion, securityAnswer, discordWebhook, updatePin }: { onLogin: () => void, storedPin: string, recoveryPhone: string, securityQuestion: string, securityAnswer: string, discordWebhook: string, updatePin: (p: string) => void }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState<'PHONE' | 'QUESTION'>('PHONE');
  const [recoveryPhoneInput, setRecoveryPhoneInput] = useState('');
  const [securityAnswerInput, setSecurityAnswerInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePin = (digit: string) => {
    if (pin.length < 6) {
      const newPinVal = pin + digit;
      setPin(newPinVal);
      if (newPinVal.length === 6) {
        if (newPinVal === storedPin) {
          onLogin();
        } else {
          setError(true);
          setTimeout(() => { 
            setPin(''); 
            setError(false); 
          }, 600);
        }
      }
    }
  };

  const startPhoneRecovery = async () => {
    if (recoveryPhoneInput !== recoveryPhone) {
      alert("Recovery number does not match!");
      return;
    }

    if (!discordWebhook) {
      alert("Discord Webhook is not configured. Please use the 'Security Question' recovery method instead.");
      setRecoveryMode('QUESTION');
      return;
    }

    setIsSending(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      const response = await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 **STALLEASE RECOVERY ATTEMPT**\nYour recovery code for **${BUSINESS_NAME}** is: \`${code}\``,
          username: 'StallEase Security'
        })
      });

      if (!response.ok) throw new Error("Delivery failed");

      setGeneratedOtp(code);
      setStatusMessage("Code sent to Discord!");
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (e) {
      alert("Discord notification failed!");
    } finally {
      setIsSending(false);
    }
  };

  const verifyQuestion = () => {
    if (securityAnswerInput.toLowerCase().trim() === securityAnswer.toLowerCase().trim()) {
      setIsVerified(true);
    } else {
      alert("Incorrect answer!");
    }
  };

  const verifyOtp = () => {
    if (otpInput === generatedOtp) {
      setIsVerified(true);
    } else {
      alert("Invalid Code!");
    }
  };

  const handleResetPin = () => {
    if (newPin.length === 6) {
      updatePin(newPin);
      alert("PIN reset successfully!");
      resetState();
    } else {
      alert("PIN must be 6 digits.");
    }
  };

  const resetState = () => {
    setShowForgot(false);
    setRecoveryPhoneInput('');
    setSecurityAnswerInput('');
    setGeneratedOtp(null);
    setOtpInput('');
    setIsVerified(false);
    setNewPin('');
    setRecoveryMode('PHONE');
    setStatusMessage(null);
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-[100] flex flex-col items-center justify-center p-6">
      {showForgot ? (
        <div className="bg-white shadow-2xl rounded-[2.5rem] p-8 md:p-12 w-full max-w-sm flex flex-col items-center border border-gray-100 animate-fade-in overflow-y-auto">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Recovery</h2>
          
          {!isVerified && (
            <div className="flex w-full mb-8 bg-gray-50 rounded-2xl p-1">
              <button 
                onClick={() => setRecoveryMode('PHONE')}
                className={`flex-1 py-2 text-[8px] font-black uppercase rounded-xl transition-all ${recoveryMode === 'PHONE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
              >
                Discord OTP
              </button>
              <button 
                onClick={() => setRecoveryMode('QUESTION')}
                className={`flex-1 py-2 text-[8px] font-black uppercase rounded-xl transition-all ${recoveryMode === 'QUESTION' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
              >
                Security Question
              </button>
            </div>
          )}

          {recoveryMode === 'PHONE' ? (
            <>
              {!generatedOtp ? (
                <div className="w-full space-y-4">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest text-center mb-4 leading-relaxed">OTP will be sent to your Discord</p>
                  <input 
                    type="tel" 
                    placeholder="Phone number" 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    value={recoveryPhoneInput}
                    onChange={e => setRecoveryPhoneInput(e.target.value)}
                  />
                  <button 
                    onClick={startPhoneRecovery}
                    disabled={isSending}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSending ? <i className="fas fa-spinner fa-spin mr-2"></i> : 'Send OTP to Discord'}
                  </button>
                </div>
              ) : !isVerified ? (
                <div className="w-full space-y-4 animate-fade-in">
                  {statusMessage && <p className="text-[9px] text-green-600 font-black text-center uppercase tracking-widest mb-2">{statusMessage}</p>}
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="Enter 6-Digit Code" 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-center text-2xl tracking-[0.3em]"
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value)}
                  />
                  <button onClick={verifyOtp} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                    Verify Code
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              {!isVerified && (
                <div className="w-full space-y-4">
                   <div className="bg-indigo-50 text-indigo-700 p-4 rounded-2xl border border-indigo-100">
                      <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-60">Question:</p>
                      <p className="text-xs font-black leading-tight">{securityQuestion}</p>
                   </div>
                   <input 
                    type="text" 
                    placeholder="Your Answer" 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    value={securityAnswerInput}
                    onChange={e => setSecurityAnswerInput(e.target.value)}
                  />
                  <button onClick={verifyQuestion} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                    Validate Answer
                  </button>
                </div>
              )}
            </>
          )}

          {isVerified && (
            <div className="w-full space-y-4 animate-fade-in">
                <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-[10px] font-black uppercase mb-4 text-center border border-green-100">
                  <i className="fas fa-shield-check mr-2"></i> Identity Confirmed
                </div>
                <input 
                  type="password" 
                  maxLength={6}
                  placeholder="Set New PIN" 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-center text-xl tracking-[0.4em]"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                />
                <button onClick={handleResetPin} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                  Update PIN
                </button>
            </div>
          )}

          <button onClick={resetState} className="text-[9px] font-black text-gray-400 uppercase mt-8 border-b border-gray-100 pb-1 hover:text-gray-900 transition-colors">Go Back</button>
        </div>
      ) : (
        <div className="bg-white shadow-2xl rounded-[2.5rem] p-8 md:p-12 w-full max-w-sm flex flex-col items-center border border-gray-100">
          <div className="mb-8 text-center">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl mb-4 mx-auto shadow-xl shadow-blue-100">
              <i className="fas fa-user-lock"></i>
            </div>
            <h2 className="text-gray-900 text-xl font-black uppercase tracking-tight">Owner Login</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Enter 6-Digit Secure PIN</p>
          </div>

          <div className={`flex space-x-2 mb-8 transition-transform ${error ? 'animate-bounce' : ''}`}>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`w-3 h-3 rounded-full border-2 border-gray-100 transition-all duration-300 ${pin.length > i ? (error ? 'bg-red-500 border-red-500' : 'bg-blue-600 border-blue-600 scale-110') : 'bg-transparent'}`}></div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button key={num} onClick={() => handlePin(num.toString())} className="aspect-square bg-gray-50 text-gray-900 rounded-2xl text-lg font-black hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center active:scale-90 shadow-sm border border-gray-100">
                {num}
              </button>
            ))}
            <div />
            <button onClick={() => handlePin('0')} className="aspect-square bg-gray-50 text-gray-900 rounded-2xl text-lg font-black hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center active:scale-90 shadow-sm border border-gray-100">0</button>
            <button onClick={() => setPin(prev => prev.slice(0, -1))} className="aspect-square text-gray-300 rounded-2xl text-base font-black hover:text-red-500 transition-all flex items-center justify-center active:scale-90">
              <i className="fas fa-backspace"></i>
            </button>
          </div>

          <div className="flex flex-col items-center mt-10 space-y-4">
            <button onClick={() => setShowForgot(true)} className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline decoration-2">Forgot PIN?</button>
            <Link to="/orders" className="text-gray-400 hover:text-gray-900 font-black uppercase tracking-widest text-[9px] transition-colors border-b border-transparent hover:border-gray-200 pb-1">Exit</Link>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const store = useStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('stallease_auth') === 'true');

  const handleLogin = () => { setIsAuthenticated(true); localStorage.setItem('stallease_auth', 'true'); };
  const handleLogout = () => { setIsAuthenticated(false); localStorage.removeItem('stallease_auth'); };
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };
  const clearCart = () => setCart([]);

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex flex-col">
        <Navigation cartCount={cartCount} isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <div className="fixed top-16 left-0 right-0 z-[55] px-4 sm:px-6 lg:px-8 pointer-events-none">
          <div className="max-w-7xl mx-auto">
            <div className="pointer-events-auto mt-3 rounded-2xl border border-orange-100 bg-white/95 backdrop-blur-md shadow-sm px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500">About / Description</p>
                <p className="text-sm font-semibold text-gray-800 leading-relaxed">{APP_DESCRIPTION}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span className="inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
                Live on main page
              </div>
            </div>
          </div>
        </div>
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24 md:pb-12">
          <Routes>
            <Route path="/" element={<CustomerMenu inventory={store.inventory} cart={cart} onAddToCart={addToCart} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />} />
            <Route path="/cart" element={<CustomerCart cart={cart} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />} />
            <Route path="/payment" element={<CustomerPayment cart={cart} onComplete={clearCart} addOrder={store.addOrder} />} />
            <Route path="/orders" element={<CustomerOrderTracking orders={store.orders} />} />
            <Route path="/owner" element={isAuthenticated ? <OwnerDashboard orders={store.orders} updateOrder={store.updateOrder} addOrder={store.addOrder} /> : <OwnerLogin onLogin={handleLogin} storedPin={store.ownerPin} recoveryPhone={store.recoveryPhone} securityQuestion={store.securityQuestion} securityAnswer={store.securityAnswer} discordWebhook={store.discordWebhook} updatePin={store.updatePin} />} />
            <Route path="/owner/history" element={isAuthenticated ? <OwnerHistory orders={store.orders} /> : <OwnerLogin onLogin={handleLogin} storedPin={store.ownerPin} recoveryPhone={store.recoveryPhone} securityQuestion={store.securityQuestion} securityAnswer={store.securityAnswer} discordWebhook={store.discordWebhook} updatePin={store.updatePin} />} />
            <Route path="/owner/inventory" element={isAuthenticated ? <OwnerInventory inventory={store.inventory} updateInventory={store.updateInventory} ownerPin={store.ownerPin} updatePin={store.updatePin} recoveryPhone={store.recoveryPhone} updateRecoveryPhone={store.updateRecoveryPhone} securityQuestion={store.securityQuestion} securityAnswer={store.securityAnswer} updateSecurityInfo={store.updateSecurityInfo} discordWebhook={store.discordWebhook} updateDiscordWebhook={store.updateDiscordWebhook} /> : <OwnerLogin onLogin={handleLogin} storedPin={store.ownerPin} recoveryPhone={store.recoveryPhone} securityQuestion={store.securityQuestion} securityAnswer={store.securityAnswer} discordWebhook={store.discordWebhook} updatePin={store.updatePin} />} />
          </Routes>
        </main>

        <footer className="py-12 border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-8 flex flex-col items-center text-gray-400 gap-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-center">© {new Date().getFullYear()} {BUSINESS_NAME} • Digital Ordering System</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
