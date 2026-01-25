
import React, { useState, useRef, useEffect } from 'react';
import { FoodItem } from '../../types';
import { GoogleGenAI } from "@google/genai";

interface InventoryProps {
  inventory: FoodItem[];
  updateInventory: (items: FoodItem[]) => void;
  ownerPin: string;
  updatePin: (pin: string) => void;
  recoveryPhone: string;
  updateRecoveryPhone: (phone: string) => void;
}

const OwnerInventory: React.FC<InventoryProps> = ({ inventory, updateInventory, ownerPin, updatePin, recoveryPhone, updateRecoveryPhone }) => {
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [showSecurity, setShowSecurity] = useState(false);
  
  const [newItem, setNewItem] = useState<Partial<FoodItem>>({
    name: '',
    price: 0,
    description: '',
    category: '',
    isAvailable: true,
    image: ''
  });

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const toggleAvailability = (id: string) => {
    updateInventory(inventory.map(item => 
      item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
    ));
  };

  const deleteItem = (id: string) => {
    if (confirm(`Delete "${inventory.find(i => i.id === id)?.name}"?`)) {
      updateInventory(inventory.filter(item => item.id !== id));
      if (editingId === id) cancelEdit();
    }
  };

  const startEdit = (item: FoodItem) => {
    setEditingId(item.id);
    setNewItem({ ...item });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewItem({ name: '', price: 0, description: '', category: '', isAvailable: true, image: '' });
  };

  const searchImageOnline = async () => {
    if (!newItem.name) {
      alert("Please enter item name first.");
      return;
    }
    setIsSearchingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Direct link to a high-res 1:1 square stock photo of "${newItem.name} food". URL only.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      const url = response.text?.trim().split('\n')[0].replace(/[\[\]\(\)]/g, '');
      if (url && url.startsWith('http')) {
        setNewItem(prev => ({ ...prev, image: url }));
      } else {
        throw new Error();
      }
    } catch (e) {
      const fallbackUrl = `https://loremflickr.com/600/600/${encodeURIComponent(newItem.name || 'food')}`;
      setNewItem(prev => ({ ...prev, image: fallbackUrl }));
    } finally {
      setIsSearchingImage(false);
    }
  };

  const handleSave = () => {
    if (!newItem.name || !newItem.price) {
      alert("Name and price required.");
      return;
    }
    const finalImage = newItem.image || `https://loremflickr.com/500/500/${encodeURIComponent(newItem.name || 'food')}`;
    if (editingId) {
      updateInventory(inventory.map(item => item.id === editingId ? { ...item, ...newItem, image: finalImage } as FoodItem : item));
    } else {
      const item: FoodItem = {
        id: `item_${Date.now()}`,
        name: newItem.name || '',
        price: newItem.price || 0,
        description: newItem.description || '',
        category: newItem.category || 'Snacks',
        isAvailable: true,
        image: finalImage
      };
      updateInventory([...inventory, item]);
    }
    cancelEdit();
  };

  const openCropper = () => {
    if (!newItem.image) return;
    setIsCropModalOpen(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = newItem.image;
    img.onload = () => {
      imgRef.current = img;
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      if (canvasRef.current) {
        canvasRef.current.width = 600;
        canvasRef.current.height = 600;
      }
      drawCanvas();
    };
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const size = canvas.width;
    const imgWidth = img.width;
    const imgHeight = img.height;
    const baseScale = Math.max(size / imgWidth, size / imgHeight);
    const scale = baseScale * zoom;
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    ctx.drawImage(img, (size - drawWidth) / 2 + offset.x, (size - drawHeight) / 2 + offset.y, drawWidth, drawHeight);
  };

  useEffect(() => {
    if (isCropModalOpen) drawCanvas();
  }, [zoom, offset, isCropModalOpen]);

  const handleMouseDown = (e: any) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setOffset({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const saveCrop = () => {
    if (canvasRef.current) setNewItem(prev => ({ ...prev, image: canvasRef.current!.toDataURL('image/jpeg', 0.8) }));
    setIsCropModalOpen(false);
  };

  const handleChangePin = () => {
    if (newPinInput.length !== 6 || isNaN(Number(newPinInput))) {
      alert("PIN must be exactly 6 digits.");
      return;
    }
    updatePin(newPinInput);
    setNewPinInput('');
    alert("PIN updated successfully!");
  };

  const handleChangePhone = () => {
    if (newPhoneInput.length < 10) {
      alert("Enter a valid phone number.");
      return;
    }
    updateRecoveryPhone(newPhoneInput);
    setNewPhoneInput('');
    alert("Recovery phone updated!");
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="px-1">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Inventory Manager</h1>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Update Your Menu Items</p>
      </header>

      <section className={`bg-white p-5 rounded-[2rem] border transition-all ${editingId ? 'border-blue-500 shadow-blue-50 ring-4 ring-blue-50/50' : 'border-gray-100 shadow-sm'}`}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-black text-sm text-gray-800 flex items-center">
            <span className={`w-8 h-8 ${editingId ? 'bg-blue-600' : 'bg-orange-500'} text-white rounded-xl flex items-center justify-center mr-2 shadow-sm`}>
              <i className={`fas ${editingId ? 'fa-pen' : 'fa-plus'} text-xs`}></i>
            </span>
            {editingId ? 'Edit Item' : 'New Dish'}
          </h2>
          {editingId && (
            <button onClick={cancelEdit} className="text-[9px] font-black uppercase text-red-400 hover:text-red-500 border border-red-50 px-3 py-1 rounded-full transition-colors">
              Discard
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Name</label>
            <input 
              type="text" placeholder="e.g. Masala Dosa" 
              className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all font-bold text-gray-800"
              value={newItem.name}
              onChange={e => setNewItem({...newItem, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Price (₹)</label>
              <input 
                type="number" placeholder="0" 
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all font-black text-gray-900"
                value={newItem.price || ''}
                onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Category</label>
              <input 
                type="text" placeholder="Snacks" 
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all font-bold text-gray-800"
                value={newItem.category}
                onChange={e => setNewItem({...newItem, category: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Photo</label>
            <div className="flex gap-2 mb-3">
              <input 
                type="text" placeholder="Image URL..." 
                className="flex-1 p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-[10px] font-bold"
                value={newItem.image}
                onChange={e => setNewItem({...newItem, image: e.target.value})}
              />
              <button 
                onClick={searchImageOnline}
                disabled={isSearchingImage}
                className="bg-gray-900 text-white px-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all min-w-[90px]"
              >
                {isSearchingImage ? <i className="fas fa-spinner fa-spin"></i> : 'AI Search'}
              </button>
            </div>
            {newItem.image && (
              <div className="flex flex-col items-center py-2">
                <div className="relative group w-40 aspect-square overflow-hidden rounded-3xl border-2 border-dashed border-gray-100 p-1 bg-white shadow-inner">
                  <img src={newItem.image} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 rounded-2xl">
                    <button onClick={openCropper} className="bg-white text-black font-black w-full py-2 rounded-xl text-[8px] uppercase tracking-widest mb-2 shadow-lg">Crop Square</button>
                    <button onClick={() => setNewItem({...newItem, image: ''})} className="bg-red-500 text-white w-full py-2 rounded-xl font-black text-[8px] uppercase tracking-widest shadow-lg">Remove</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleSave}
            className={`w-full text-white font-black py-4 rounded-[1.2rem] shadow-xl active:scale-95 transition-all text-[11px] uppercase tracking-widest ${editingId ? 'bg-blue-600 shadow-blue-100' : 'bg-orange-600 shadow-orange-100'}`}
          >
            {editingId ? 'Update Item' : 'Add to Menu'}
          </button>
        </div>
      </section>

      <div className="space-y-3 px-1">
        <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
          <i className="fas fa-layer-group mr-2"></i> Current Items ({inventory.length})
        </h3>
        <div className="grid gap-2.5">
          {inventory.map(item => (
            <div key={item.id} className={`bg-white p-2.5 rounded-[1.25rem] border transition-all flex items-center justify-between ${editingId === item.id ? 'border-blue-500 bg-blue-50/10' : 'border-gray-50 shadow-sm'}`}>
              <div className="flex items-center space-x-3 min-w-0">
                <img src={item.image} alt="" className={`w-12 h-12 rounded-xl object-cover shadow-sm shrink-0 ${item.isAvailable ? '' : 'grayscale opacity-30'}`} />
                <div className="truncate">
                  <h4 className="font-bold text-gray-900 text-xs truncate leading-none">{item.name}</h4>
                  <p className="text-[10px] font-black text-orange-600 mt-1">₹{item.price}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                 <button onClick={() => toggleAvailability(item.id)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${item.isAvailable ? 'text-green-500 bg-green-50' : 'text-gray-300 bg-gray-50'}`}>
                   <i className={`fas ${item.isAvailable ? 'fa-eye' : 'fa-eye-slash'} text-[10px]`}></i>
                 </button>
                 <button onClick={() => startEdit(item)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-500 rounded-lg">
                    <i className="fas fa-edit text-[10px]"></i>
                 </button>
                 <button onClick={() => deleteItem(item.id)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-lg">
                    <i className="fas fa-trash-alt text-[10px]"></i>
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="mt-12 bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
            <i className="fas fa-shield-alt mr-2"></i> Security Settings
          </h3>
          <button onClick={() => setShowSecurity(!showSecurity)} className="text-[9px] font-black uppercase text-blue-600">
            {showSecurity ? 'Hide' : 'Manage Access'}
          </button>
        </div>

        {showSecurity && (
          <div className="space-y-8 animate-in fade-in duration-300">
             <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Change 6-Digit Owner PIN</label>
                <div className="flex space-x-2">
                  <input 
                    type="password" 
                    maxLength={6}
                    placeholder="New PIN" 
                    className="flex-1 p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-center"
                    value={newPinInput}
                    onChange={e => setNewPinInput(e.target.value)}
                  />
                  <button onClick={handleChangePin} className="bg-blue-600 text-white px-4 rounded-2xl font-black text-[9px] uppercase tracking-widest">Update</button>
                </div>
             </div>

             <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Recovery Phone (for Forgot PIN)</label>
                <div className="flex space-x-2">
                  <input 
                    type="tel" 
                    placeholder={recoveryPhone}
                    className="flex-1 p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={newPhoneInput}
                    onChange={e => setNewPhoneInput(e.target.value)}
                  />
                  <button onClick={handleChangePhone} className="bg-gray-900 text-white px-4 rounded-2xl font-black text-[9px] uppercase tracking-widest">Update</button>
                </div>
             </div>
          </div>
        )}
      </section>

      {isCropModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm flex flex-col items-center space-y-6">
            <div className="text-center">
              <h2 className="text-white font-black text-lg uppercase tracking-tight">Square Fixer</h2>
              <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mt-1">Drag to position, use slider to zoom</p>
            </div>
            <div 
              className="relative w-64 aspect-square bg-gray-900 overflow-hidden rounded-3xl ring-2 ring-white/10 cursor-move"
              onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)}
              onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={() => setIsDragging(false)}
            >
              <canvas ref={canvasRef} width={600} height={600} className="w-full h-full object-contain" />
              <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-3xl"></div>
            </div>
            <div className="w-full px-6 space-y-4">
              <input type="range" min="1" max="5" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-orange-500 h-1 bg-white/10 rounded-full appearance-none outline-none" />
              <div className="flex space-x-3">
                <button onClick={() => setIsCropModalOpen(false)} className="flex-1 py-3 text-white/40 font-black text-[9px] uppercase tracking-widest">Cancel</button>
                <button onClick={saveCrop} className="flex-[2] bg-orange-600 text-white font-black py-3 rounded-xl shadow-lg text-[9px] uppercase tracking-widest">Save Crop</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerInventory;
