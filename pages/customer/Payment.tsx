
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem, Order, OrderStatus } from '../../types';
import { UPI_ID, BUSINESS_NAME, DISCORD_WEBHOOK_URL } from '../../constants';
import { useStore } from '../../store';

interface PaymentProps {
  cart: CartItem[];
  onComplete: () => void;
  addOrder: (order: Order) => void;
}

const CustomerPayment: React.FC<PaymentProps> = ({ cart, onComplete, addOrder }) => {
  const navigate = useNavigate();
  const store = useStore();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Generate the UPI URL exactly how GPay/PhonePe prefer it
  const upiUrl = useMemo(() => {
    const cleanUpiId = UPI_ID.trim();
    const orderId = `TR${Date.now()}`;
    const amount = total.toFixed(2); // Use 2 decimal places as per UPI spec
    
    // Format: upi://pay?pa=...&pn=...&am=...&cu=INR&tr=...&tn=...
    // Note: Placing 'am' and 'pa' first is most reliable for GPay
    return `upi://pay?pa=${cleanUpiId}&pn=${encodeURIComponent(BUSINESS_NAME)}&am=${amount}&cu=INR&tr=${orderId}&tn=${encodeURIComponent('StallOrder' + orderId.slice(-4))}`;
  }, [total]);

  const sendDiscordNotification = async (order: Order) => {
    const webhook = store.discordWebhook || DISCORD_WEBHOOK_URL;
    if (!webhook) return;

    const itemsList = order.items.map(i => `• ${i.quantity}x ${i.name}`).join('\n');
    
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `💰 NEW PAYMENT ATTEMPT: ₹${order.totalPrice}`,
            color: 16750848,
            description: `**Items:**\n${itemsList}\n\n**App:** ${order.paymentMethod}`,
            footer: { text: "Verify screenshot at counter" }
          }]
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const finalizeAndPay = async () => {
    if (!selectedApp) return;

    const orderId = `ord${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      totalPrice: total,
      timestamp: Date.now(),
      status: OrderStatus.PAID_PENDING_CONFIRMATION,
      paymentMethod: selectedApp
    };

    // 1. Save order locally
    addOrder(newOrder);
    
    // 2. Clear cart
    onComplete();

    // 3. Optional: Notify Discord
    sendDiscordNotification(newOrder);

    // 4. Trigger the deep link
    // Using window.location.assign is often more robust for deep links
    window.location.assign(upiUrl);

    // 5. Navigate to orders so they can see the QR when they come back
    setTimeout(() => {
      navigate('/orders');
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Payment</h1>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">Select your app to pay ₹{total}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        {[
          { name: 'Google Pay', id: 'GPay', icon: 'fab fa-google-pay', color: 'text-blue-500' },
          { name: 'PhonePe', id: 'PhonePe', icon: 'fas fa-mobile-alt', color: 'text-purple-600' },
          { name: 'Paytm', id: 'Paytm', icon: 'fas fa-wallet', color: 'text-cyan-500' },
          { name: 'Any UPI', id: 'Other', icon: 'fas fa-qrcode', color: 'text-gray-800' }
        ].map(app => (
          <button 
            key={app.id}
            onClick={() => setSelectedApp(app.name)}
            className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all active:scale-95 ${selectedApp === app.name ? 'bg-orange-600 border-orange-600 text-white shadow-xl shadow-orange-100' : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200'}`}
          >
            <i className={`${app.icon} text-3xl mb-3 ${selectedApp === app.name ? 'text-white' : app.color}`}></i>
            <span className="text-[10px] font-black uppercase tracking-widest">{app.name}</span>
          </button>
        ))}
      </div>

      {selectedApp ? (
        <div className="animate-slide-up space-y-4">
          <button 
            onClick={finalizeAndPay}
            className="w-full bg-gray-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center space-x-3"
          >
            <span>PROCEED WITH {selectedApp.toUpperCase()}</span>
            <i className="fas fa-arrow-right"></i>
          </button>
          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed px-4">
            If the amount is not ₹{total}, please enter it manually.<br/>
            Show your payment screenshot at the counter!
          </p>
        </div>
      ) : (
        <div className="text-center py-10 opacity-20">
          <i className="fas fa-arrow-up text-2xl mb-2 animate-bounce"></i>
          <p className="text-[10px] font-black uppercase tracking-widest">Select an app above</p>
        </div>
      )}

      <div className="mt-12 text-center">
        <button onClick={() => navigate('/cart')} className="text-[9px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-900">
           Cancel Transaction
        </button>
      </div>
    </div>
  );
};

export default CustomerPayment;
