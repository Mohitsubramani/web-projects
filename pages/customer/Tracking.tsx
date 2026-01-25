
import React from 'react';
import { Link } from 'react-router-dom';
import { Order, OrderStatus } from '../../types';

interface TrackingProps {
  orders: Order[];
}

const CustomerOrderTracking: React.FC<TrackingProps> = ({ orders }) => {
  const myOrders = [...orders].sort((a, b) => b.timestamp - a.timestamp);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAID_PENDING_CONFIRMATION: return 'text-blue-500';
      case OrderStatus.PREPARING: return 'text-orange-500';
      case OrderStatus.COMPLETED: return 'text-green-500';
      case OrderStatus.DELIVERED: return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAID_PENDING_CONFIRMATION: return 'Verifying Payment';
      case OrderStatus.PREPARING: return 'Cooking Now';
      case OrderStatus.COMPLETED: return 'Pick Up Ready!';
      case OrderStatus.DELIVERED: return 'Enjoy Your Food!';
      case OrderStatus.CANCELLED: return 'Order Cancelled';
      default: return 'Order Placed';
    }
  };

  const generateQRUrl = (order: Order) => {
    // We encode the essential order data for cross-device sync
    const data = JSON.stringify({
      id: order.id,
      items: order.items.map(i => ({ n: i.name, q: i.quantity, p: i.price })),
      t: order.totalPrice,
      ts: order.timestamp,
      pm: order.paymentMethod
    });
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24 px-1">
      <header className="flex items-center justify-between px-2">
        <div>
           <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Your Orders</h2>
           <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Live updates from kitchen</p>
        </div>
        <Link to="/" className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
          <i className="fas fa-plus text-xs"></i>
        </Link>
      </header>

      <div className="space-y-4">
        {myOrders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-receipt text-xl text-gray-200"></i>
            </div>
            <p className="text-gray-300 font-black uppercase tracking-widest text-[9px]">No orders yet</p>
            <Link to="/" className="mt-8 bg-orange-600 text-white px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-orange-50">View Menu</Link>
          </div>
        ) : (
          myOrders.map(order => (
            <div key={order.id} className={`bg-white rounded-[2.5rem] shadow-sm border p-6 overflow-hidden transition-all ${order.status === OrderStatus.COMPLETED ? 'border-green-200 ring-8 ring-green-50' : 'border-gray-50'}`}>
              
              <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-5">
                <div className="flex flex-col">
                  <span className={`text-[9px] font-black uppercase tracking-widest flex items-center ${getStatusColor(order.status)}`}>
                    <span className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse"></span>
                    {getStatusLabel(order.status)}
                  </span>
                  <span className="text-[10px] text-gray-900 font-black uppercase mt-2">ID: {order.id.slice(-6).toUpperCase()}</span>
                </div>
                {order.token && (
                  <div className="bg-orange-600 text-white px-5 py-3 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-orange-100">
                    <span className="text-[7px] font-black uppercase leading-none opacity-60">Token No.</span>
                    <span className="text-2xl font-black leading-none mt-1">#{order.token}</span>
                  </div>
                )}
              </div>

              {/* QR CODE FOR VERIFICATION (ONLY FOR PENDING) */}
              {order.status === OrderStatus.PAID_PENDING_CONFIRMATION && (
                <div className="mb-8 flex flex-col items-center p-4 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Owner must scan this to confirm</p>
                  <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                    <img src={generateQRUrl(order)} alt="Order QR" className="w-32 h-32" />
                  </div>
                  <p className="text-[9px] font-black text-gray-900 mt-4 uppercase">Verification QR</p>
                </div>
              )}

              {order.status === OrderStatus.COMPLETED && (
                <div className="mb-6 bg-green-600 text-white p-4 rounded-2xl text-center shadow-xl shadow-green-100 animate-bounce">
                  <p className="text-[11px] font-black uppercase tracking-widest">Order Ready! Pickup Now 🍔</p>
                </div>
              )}

              <div className="space-y-2 mb-6 opacity-90">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[12px] font-bold">
                    <span className="text-gray-700">{item.quantity}x {item.name}</span>
                    <span className="text-gray-400">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-gray-50">
                <div className="flex flex-col">
                   <span className="text-[8px] text-gray-300 font-black uppercase tracking-widest">Grand Total</span>
                   <span className="font-black text-xl text-gray-900">₹{order.totalPrice}</span>
                </div>
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                  {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="mt-20 text-center opacity-40 hover:opacity-100 transition-opacity">
        <Link to="/owner" className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
          <i className="fas fa-lock mr-2"></i>Staff Portal
        </Link>
      </footer>
    </div>
  );
};

export default CustomerOrderTracking;
