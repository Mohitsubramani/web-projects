
import React from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from '../../types';

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

const CustomerCart: React.FC<CartProps> = ({ cart, onUpdateQuantity, onRemove }) => {
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-shopping-basket text-2xl text-gray-300"></i>
        </div>
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Cart is Empty</h2>
        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mt-2">Add some items to get started</p>
        <Link to="/" className="mt-8 bg-orange-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-100">Start Ordering</Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2 mb-4">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Your Basket</h2>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cart.length} Items</span>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        {cart.map(item => (
          <div key={item.id} className="flex items-center p-4 border-b border-gray-50 last:border-0">
            <img src={item.image} className="w-12 h-12 rounded-xl object-cover shadow-sm mr-4" alt="" />
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-xs text-gray-800 truncate">{item.name}</h3>
              <p className="text-[10px] font-bold text-orange-600">₹{item.price} per unit</p>
            </div>
            <div className="flex items-center space-x-3 ml-4">
              <div className="flex items-center bg-gray-50 rounded-xl p-0.5 border border-gray-100">
                <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-gray-400"><i className="fas fa-minus text-[8px]"></i></button>
                <span className="px-2 font-black text-xs">{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-gray-900"><i className="fas fa-plus text-[8px]"></i></button>
              </div>
              <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                <i className="fas fa-trash-alt text-xs"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To be paid</span>
            <span className="text-3xl font-black text-gray-900">₹{total}</span>
          </div>
          <i className="fas fa-wallet text-gray-100 text-4xl"></i>
        </div>
        <Link 
          to="/payment" 
          className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-100 transition active:scale-95"
        >
          Proceed to Checkout
        </Link>
      </div>

      <div className="text-center pt-8">
        <Link to="/" className="text-[9px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-900 transition-colors">
          <i className="fas fa-arrow-left mr-2"></i> Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default CustomerCart;
