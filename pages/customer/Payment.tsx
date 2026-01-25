
import React, { useState } from 'react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const sendDiscordNotification = async (order: Order) => {
    const webhook = store.discordWebhook || DISCORD_WEBHOOK_URL;
    if (!webhook) return;

    const itemsList = order.items.map(i => `• ${i.quantity}x ${i.name} (₹${i.price * i.quantity})`).join('\n');
    
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `🍔 NEW ORDER: #${order.id.slice(-6).toUpperCase()}`,
            color: 16750848, // Orange
            fields: [
              { name: "Items Ordered", value: itemsList || "No items?" },
              { name: "Total Amount", value: `**₹${order.totalPrice}**`, inline: true },
              { name: "Payment Via", value: order.paymentMethod || "UPI", inline: true }
            ],
            footer: { text: "Show the verification QR to confirm payment" },
            timestamp: new Date().toISOString()
          }],
          username: 'StallEase Kitchen'
        })
      });
    } catch (e) {
      console.error("Discord notification failed", e);
    }
  };

  const handleUPILink = async (app: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(BUSINESS_NAME)}&am=${total.toFixed(2)}&cu=INR&tn=FoodOrder_${orderId}`;

    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      totalPrice: total,
      timestamp: Date.now(),
      status: OrderStatus.PAID_PENDING_CONFIRMATION,
      paymentMethod: app
    };

    // 1. Add locally
    addOrder(newOrder);
    
    // 2. Notify Owner (Instant)
    await sendDiscordNotification(newOrder);

    // 3. Complete and Redirect
    onComplete();
    setTimeout(() => {
      window.location.href = upiUrl;
      setTimeout(() => navigate('/orders'), 800);
    }, 100);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 md:py-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="mb-10 text-center md:text-left px-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>
        <p className="text-gray-400 text-sm font-medium mt-2">Choose your preferred payment app</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-10 px-2">
        {[
          { name: 'Google Pay', id: 'GPay', icon: 'fab fa-google-pay', color: 'blue' },
          { name: 'PhonePe', id: 'PhonePe', icon: 'fas fa-mobile-alt', color: 'purple' },
          { name: 'Paytm', id: 'Paytm', icon: 'fas fa-wallet', color: 'cyan' },
          { name: 'Any UPI', id: 'Other', icon: 'fas fa-qrcode', color: 'orange' }
        ].map(method => (
          <button 
            key={method.id}
            disabled={isProcessing}
            onClick={() => handleUPILink(method.name)}
            className="flex flex-col items-center justify-center bg-white p-6 md:p-8 rounded-[2rem] border-2 border-transparent hover:border-orange-500 hover:shadow-xl transition-all group disabled:opacity-50 active:scale-95"
          >
            <div className={`w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 mb-4 transition-transform group-hover:scale-110`}>
              <i className={`${method.icon} text-2xl`}></i>
            </div>
            <span className="font-black text-gray-900 text-[10px] uppercase tracking-widest">{method.name}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm mx-2">
        <div className="flex items-center space-x-3 mb-4">
           <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
             <i className="fas fa-info-circle text-sm"></i>
           </div>
           <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Total: ₹{total}</h4>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
          Once you complete payment, your order details will be sent to the chef instantly. Please show the <strong>success screenshot</strong> and the <strong>Verification QR</strong> (on next page) at the counter.
        </p>
      </div>

      <div className="mt-8 text-center">
        <button onClick={() => navigate('/cart')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
          <i className="fas fa-arrow-left mr-2"></i> Edit Cart
        </button>
      </div>
    </div>
  );
};

export default CustomerPayment;
