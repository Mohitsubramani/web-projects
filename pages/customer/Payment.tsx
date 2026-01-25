
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
  const [isDownloading, setIsDownloading] = useState(false);
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Generate the UPI URL with the most robust parameter order for GPay/PhonePe
  const upiUrl = useMemo(() => {
    const cleanUpiId = UPI_ID.trim();
    const orderId = `TR${Date.now()}`;
    const amount = total.toFixed(2);
    
    // Format: pa=address & pn=name & am=amount & tr=ref & tn=note & cu=currency & mode=02 (Pay to person)
    return `upi://pay?pa=${cleanUpiId}&pn=${encodeURIComponent(BUSINESS_NAME)}&am=${amount}&tr=${orderId}&tn=${encodeURIComponent('Order' + orderId.slice(-4))}&cu=INR&mode=02`;
  }, [total]);

  // Dynamic QR code URL for the same transaction
  const paymentQR = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiUrl)}`;

  const downloadQR = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(paymentQR);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `StallEase_Payment_₹${total}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      // Fallback: Open in new tab
      window.open(paymentQR, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

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
            title: `💰 PAYMENT INITIATED: ₹${order.totalPrice}`,
            color: 16750848,
            description: `**Items:**\n${itemsList}\n\n**Order ID:** ${order.id.slice(-6).toUpperCase()}`,
            footer: { text: "Verify payment success screenshot" }
          }]
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const finalizeAndRedirect = (method: string) => {
    const orderId = `ord${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      totalPrice: total,
      timestamp: Date.now(),
      status: OrderStatus.PAID_PENDING_CONFIRMATION,
      paymentMethod: method
    };

    addOrder(newOrder);
    onComplete();
    sendDiscordNotification(newOrder);

    if (method === 'QR') {
      // If they chose QR, we just navigate to orders where they can see the QR
      navigate('/orders');
    } else {
      // Trigger intent
      window.location.href = upiUrl;
      setTimeout(() => navigate('/orders'), 1500);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    alert("UPI ID Copied! You can now paste it in your payment app.");
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Pay ₹{total}</h1>
        <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-2">Secure UPI Transaction</p>
      </div>

      {/* OPTION 1: SMART QR (Best fallback if deep link fails) */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl mb-6 text-center">
        <div className="mb-4">
           <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Recommended Way</span>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-3xl inline-block mb-4 border border-gray-100 relative group">
          <img src={paymentQR} alt="Payment QR" className="w-48 h-48 mx-auto" />
          <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
             <i className="fas fa-qrcode text-3xl text-gray-900"></i>
          </div>
        </div>
        
        <h3 className="text-gray-900 font-black text-xs uppercase mb-1 tracking-tight">Save & Scan</h3>
        <p className="text-gray-400 text-[10px] font-medium leading-tight mb-6">
          Download this QR and upload it to GPay/PhonePe scanner to lock the amount.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={downloadQR}
            disabled={isDownloading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center"
          >
            {isDownloading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-download mr-2"></i>}
            {isDownloading ? 'Downloading...' : 'Save QR to Gallery'}
          </button>
          
          <button 
            onClick={() => finalizeAndRedirect('QR')}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            I've Scanned the QR
          </button>
        </div>
      </div>

      {/* OPTION 2: DIRECT APP BUTTONS */}
      <div className="space-y-3 mb-8">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center mb-4">Or Open App Directly</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => finalizeAndRedirect('GPay')}
            className="flex items-center justify-center space-x-2 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm active:scale-95 transition-all hover:border-blue-200"
          >
            <i className="fab fa-google-pay text-2xl text-blue-500"></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">GPay</span>
          </button>
          
          <button 
            onClick={() => finalizeAndRedirect('PhonePe')}
            className="flex items-center justify-center space-x-2 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm active:scale-95 transition-all hover:border-purple-200"
          >
            <i className="fas fa-mobile-alt text-lg text-purple-600"></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">PhonePe</span>
          </button>
        </div>

        <button 
          onClick={copyUpiId}
          className="w-full py-4 bg-gray-50 text-gray-400 border border-gray-100 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:text-gray-900 transition-all flex items-center justify-center"
        >
          <i className="fas fa-copy mr-2"></i> Copy UPI ID: {UPI_ID}
        </button>
      </div>

      <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
        <div className="flex items-start space-x-3">
          <i className="fas fa-exclamation-triangle text-orange-500 mt-1"></i>
          <div>
            <h4 className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-1">Important Instruction</h4>
            <p className="text-[10px] text-orange-700 font-medium leading-relaxed">
              If the app opens with ₹0, please manually type <strong className="text-orange-900">₹{total}</strong>. 
              Show the successful payment screen at the counter to get your token.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPayment;
