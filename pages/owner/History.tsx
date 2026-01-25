
import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';

interface HistoryProps {
  orders: Order[];
}

const OwnerHistory: React.FC<HistoryProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const completedOrders = orders
    .filter(o => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.DELIVERED || o.status === OrderStatus.CANCELLED)
    .sort((a, b) => b.timestamp - a.timestamp);

  const filtered = completedOrders.filter(o => 
    o.token?.toString().includes(searchTerm) || 
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEarnings = completedOrders
    .filter(o => o.status === OrderStatus.DELIVERED || o.status === OrderStatus.COMPLETED)
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const getStatusStyle = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.DELIVERED: return 'bg-gray-100 text-gray-600';
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-600';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Sales Ledger</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Transaction history & Earnings</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-[1.5rem] border border-gray-100 shadow-sm text-center md:text-right w-full md:w-auto">
          <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">Total Collection</p>
          <p className="text-3xl font-black text-green-600">₹{totalEarnings}</p>
        </div>
      </header>

      <div className="relative group">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors"></i>
        <input 
          type="text" 
          placeholder="Search Token or Order ID..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-gray-700 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-[1.5rem] border border-gray-50 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              {order.token ? (
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex flex-col items-center justify-center font-black text-gray-400 mr-4 border border-gray-100">
                  <span className="text-[6px] uppercase leading-none opacity-60">TK</span>
                  <span className="text-lg leading-none mt-0.5">#{order.token}</span>
                </div>
              ) : (
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-300 mr-4">
                  <i className="fas fa-times"></i>
                </div>
              )}
              <div>
                <p className="text-sm font-black text-gray-800">₹{order.totalPrice} <span className="text-[10px] text-gray-400 font-bold ml-2">• {order.items.length} items</span></p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{new Date(order.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
              </div>
            </div>
            <div className={`text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${getStatusStyle(order.status)}`}>
              {order.status.replace('_', ' ')}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-20 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
            <p className="text-gray-300 font-black uppercase tracking-widest text-[9px]">No records match your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerHistory;
