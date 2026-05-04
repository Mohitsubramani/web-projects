
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem, Order, OrderStatus } from '../../types';
import { UPI_ID, BUSINESS_NAME, APP_NAME, APP_DESCRIPTION, CONTACT_EMAIL } from '../../constants';
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

  /**
   * THE "MERCHANT HACK" URL
   * mc=5812 is the Merchant Category Code for Eating Places/Restaurants
   * mc=5411 is for Groceries
   * tn is Transaction Note (makes it look like a real order)
   */
  const upiUrl = useMemo(() => {
    const cleanUpiId = UPI_ID.trim();
    const amount = total.toFixed(2);
    const business = encodeURIComponent(BUSINESS_NAME);
    const note = encodeURIComponent(`Order_${Date.now().toString().slice(-4)}`);
    
    // We use the most expanded format possible which mirrors professional gateways
    return `upi://pay?pa=${cleanUpiId}&pn=${business}&am=${amount}&cu=INR&tn=${note}&mc=5812&mode=02&purpose=00`;
  }, [total]);

  const paymentQR = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiUrl)}`;

  const copyAmountToClipboard = () => {
    navigator.clipboard.writeText(total.toString());
  };

  const downloadQR = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(paymentQR);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `STALL_PAY_₹${total}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(paymentQR, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAppPayment = (method: string) => {
    // BACKUP: Copy amount so they can paste if the hack fails
    copyAmountToClipboard();
    
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
    
    // Trigger the intent
    window.location.href = upiUrl;
    
    // Redirect to orders so they can see their token status
    setTimeout(() => navigate('/orders'), 1500);
  };

  return (
    <div className="max-w-xl mx-auto py-4 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Complete Payment</h1>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Pay exactly ₹{total} to {BUSINESS_NAME}</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm mb-8">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Razorpay verification details</p>
        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">App name</span>
            <span className="text-gray-900 font-black text-right">{APP_NAME}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Description</span>
            <span className="text-gray-900 font-bold text-right leading-tight">{APP_DESCRIPTION}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Contact email</span>
            <span className="text-gray-900 font-black text-right break-all">{CONTACT_EMAIL}</span>
          </div>
        </div>
      </div>

      {/* PRICE CARD */}
      <div className="bg-orange-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-orange-200 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Bill</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold">₹</span>
            <h2 className="text-6xl font-black tracking-tighter">{total}</h2>
          </div>
          <button 
            onClick={() => { copyAmountToClipboard(); alert("Price Copied!"); }}
            className="mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
          >
            <i className="fas fa-copy mr-2"></i> Copy Price
          </button>
        </div>
        <i className="fas fa-coins absolute -bottom-6 -right-6 text-white/10 text-[10rem] rotate-12"></i>
      </div>

      {/* APP CHOICES */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => handleAppPayment('GPay')}
          className="bg-white border-2 border-gray-50 p-6 rounded-[2.5rem] shadow-sm active:scale-95 transition-all flex flex-col items-center group hover:border-blue-500"
        >
          <i className="fab fa-google-pay text-4xl text-blue-500 mb-2 group-hover:scale-110 transition-transform"></i>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">GPay</span>
        </button>
        <button 
          onClick={() => handleAppPayment('PhonePe')}
          className="bg-white border-2 border-gray-50 p-6 rounded-[2.5rem] shadow-sm active:scale-95 transition-all flex flex-col items-center group hover:border-purple-500"
        >
          <i className="fas fa-mobile-alt text-3xl text-purple-600 mb-2 group-hover:scale-110 transition-transform"></i>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">PhonePe</span>
        </button>
      </div>

      {/* QR ALTERNATIVE */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl mb-8 flex flex-col items-center">
        <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 mb-6">
          <img src={paymentQR} alt="UPI QR" className="w-40 h-40" />
        </div>
        <div className="grid grid-cols-2 gap-3 w-full">
          <button 
            onClick={downloadQR}
            className="bg-gray-100 text-gray-600 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest"
          >
            <i className="fas fa-download mr-2"></i> Save QR
          </button>
          <button 
            onClick={() => {
              const orderId = `ord${Date.now()}`;
              addOrder({
                id: orderId,
                items: [...cart],
                totalPrice: total,
                timestamp: Date.now(),
                status: OrderStatus.PAID_PENDING_CONFIRMATION,
                paymentMethod: 'QR Scan'
              });
              onComplete();
              navigate('/orders');
            }}
            className="bg-gray-900 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest"
          >
            I've Paid
          </button>
        </div>
      </div>

      {/* PRO TIPS */}
      <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 mb-12">
        <div className="flex items-start space-x-3">
          <i className="fas fa-shield-alt text-blue-600 mt-1"></i>
          <div>
            <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">If App Shows ₹0</h4>
            <p className="text-[11px] text-blue-800 font-bold leading-tight">
              Type <span className="underline">₹{total}</span> manually and complete the payment. 
              Show the success screen at the counter to get your <span className="text-blue-900">Token Number</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPayment;
