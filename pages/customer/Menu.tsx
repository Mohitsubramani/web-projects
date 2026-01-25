
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FoodItem, CartItem } from '../../types';
import { BUSINESS_NAME } from '../../constants';

interface MenuProps {
  inventory: FoodItem[];
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

const CustomerMenu: React.FC<MenuProps> = ({ inventory, cart, onAddToCart, onUpdateQuantity, onRemove }) => {
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const getItemQuantity = (id: string) => cart.find(i => i.id === id)?.quantity || 0;

  // Priority categories: Combos comes first, then Burgers, then others
  const priorityOrder = ['Combos', 'Burgers', 'Sides', 'Beverages'];
  const uniqueCategories = Array.from(new Set(inventory.map(item => item.category)));
  
  const categories = [
    'All Items',
    ...priorityOrder.filter(cat => uniqueCategories.includes(cat)),
    ...uniqueCategories.filter(cat => !priorityOrder.includes(cat))
  ];

  const filteredInventory = inventory.filter(item => {
    const matchesAvailability = item.isAvailable;
    const matchesCategory = selectedCategory === 'All Items' || item.category === selectedCategory;
    return matchesAvailability && matchesCategory;
  });

  return (
    <div className="animate-in fade-in duration-700">
      {/* HERO SECTION - COMPACT */}
      <section className="mb-6 py-6 md:py-8 bg-gradient-to-br from-orange-600 to-orange-400 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase leading-none">
            {BUSINESS_NAME}
          </h1>
          <p className="text-orange-50/80 text-[10px] font-black uppercase tracking-widest mt-2">
            Freshly Prepared • Order Now
          </p>
        </div>
        <i className="fas fa-utensils absolute -bottom-4 -right-4 text-white/10 text-[8rem] rotate-12"></i>
      </section>

      {/* HORIZONTAL CATEGORY SCROLLER */}
      <div className="sticky top-16 bg-[#f8f9fa] z-40 py-3 -mx-4 px-4 overflow-hidden border-b border-gray-100 mb-6 shadow-sm">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
           {categories.map(cat => (
             <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border shadow-sm ${selectedCategory === cat ? 'bg-orange-600 text-white border-orange-600 scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200 hover:text-orange-600'}`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      {/* MENU GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-32">
        {filteredInventory.length > 0 ? filteredInventory.map(item => {
          const qty = getItemQuantity(item.id);
          return (
            <div key={item.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col shadow-sm transition-all duration-300 group active:scale-[0.98] hover:shadow-md">
              <div className="relative h-44 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {qty > 0 && (
                  <div className="absolute top-2 right-2 bg-orange-600 text-white w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg">
                    {qty}
                  </div>
                )}
                <div className="absolute bottom-2 left-2">
                  <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[8px] font-black uppercase px-2 py-1 rounded-lg tracking-widest">{item.category}</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-3">
                  <h3 className="text-sm font-black text-gray-900 leading-tight truncate">{item.name}</h3>
                  <p className="text-gray-400 text-[9px] mt-1 line-clamp-1 font-medium">{item.description}</p>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-md font-black text-gray-900">₹{item.price}</span>

                  {qty === 0 ? (
                    <button
                      onClick={() => onAddToCart({ ...item, quantity: 1 })}
                      className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95 hover:bg-orange-600"
                    >
                      Add +
                    </button>
                  ) : (
                    <div className="flex items-center bg-gray-50 rounded-xl p-0.5 border border-gray-100">
                      <button 
                        onClick={() => qty === 1 ? onRemove(item.id) : onUpdateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500"
                      >
                        <i className={`fas ${qty === 1 ? 'fa-trash text-[8px]' : 'fa-minus text-[8px]'}`}></i>
                      </button>
                      <span className="px-2 font-black text-gray-900 text-[10px]">{qty}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-900 hover:text-orange-600"
                      >
                        <i className="fas fa-plus text-[8px]"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 text-center opacity-30">
            <i className="fas fa-search text-3xl mb-2"></i>
            <p className="text-[10px] font-black uppercase">No Items found</p>
          </div>
        )}
      </div>

      {/* FLOATING CHECKOUT BAR - ALWAYS VISIBLE WHEN CART HAS ITEMS */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 md:bottom-8 left-4 right-4 z-50 animate-in slide-in-from-bottom-10">
          <Link to="/cart" className="flex items-center justify-between bg-gray-900 text-white p-4 md:p-5 rounded-2xl shadow-2xl border border-gray-700 hover:bg-black transition-all group max-w-2xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-600 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-inner">
                {cartCount}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-[10px] uppercase tracking-[0.2em]">View Basket</span>
                <span className="text-[8px] opacity-40 uppercase font-bold tracking-widest hidden sm:inline">Checkout next</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-lg md:text-xl font-black">₹{cartTotal}</span>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                 <i className="fas fa-arrow-right text-[10px]"></i>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;
