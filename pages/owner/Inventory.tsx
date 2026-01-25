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
  securityQuestion: string;
  securityAnswer: string;
  updateSecurityInfo: (question: string, answer: string) => void;
  discordWebhook: string;
  updateDiscordWebhook: (url: string) => void;
}

const OwnerInventory: React.FC<InventoryProps> = ({ inventory, updateInventory, ownerPin, updatePin, recoveryPhone, updateRecoveryPhone, securityQuestion, securityAnswer, updateSecurityInfo, discordWebhook, updateDiscordWebhook }) => {
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [newQuestionInput, setNewQuestionInput] = useState(securityQuestion);
  const [newAnswerInput, setNewAnswerInput] = useState(securityAnswer);
  const [newWebhookInput, setNewWebhookInput] = useState(discordWebhook);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
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

  const shopUrl = window.location.origin + window.location.pathname;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shopUrl)}`;

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
        contents: `Provide ONLY one direct image URL for "${newItem.name}". Link to a high-quality stock photo.`
      });
      
      const url = response.text?.trim().match(/https?:\/\/[^\s]+(?:\.jpg|\.png|\.jpeg|\?|&)[^\s]*/i)?.[0];
      if (url) {
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

  const handleChangePin = () => {
    if (newPinInput.length !== 6 || isNaN(Number(newPinInput))) {
      alert("PIN must be exactly 6 digits.");
      return;
    }
    updatePin(newPinInput);
    setNewPinInput('');
    alert("PIN updated successfully!");
  };

  const handleUpdateSecurity = () => {
    if (!newQuestionInput || !newAnswerInput) {
      alert("Both question and answer are required.");
      return;
    }
    updateSecurityInfo(newQuestionInput, newAnswerInput);
    updateDiscordWebhook(newWebhookInput);
    alert("Security and Discord settings updated!");
  };

  const saveCrop = () => {
    if (canvasRef.current) setNewItem(prev => ({ ...prev, image: canvasRef.current!.toDataURL('image/jpeg', 0.8) }));
    setIsCropModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="px-1 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Menu Manager</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Live Store Editor</p>
        </div>
        <button 
          onClick={() => setShowQR(!showQR)}
          className="bg-gray-900 text-white p-3 rounded-2xl flex items-center space-x-2 shadow-xl active:scale-95 transition-all"
        >
          <i className="fas fa-qrcode"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Get Shop QR</span>
        </button>
      </header>

      {/* SHOP QR MODAL/DISPLAY */}
      {showQR && (
        <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] text-center shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-4">Your Customer QR</h3>
            <div className="bg-white p-6 rounded-[2rem] shadow-inner mb-6">
              <img src={qrUrl} alt="Store QR" className="w-48 h-48" />
            </div>
            <p className="text-indigo-100 text-[9px] font-bold uppercase tracking-widest mb-6 max-w-[200px] leading-relaxed">
              Print this and place it on your stall. Customers scan this to see your menu.
            </p>
            <div className="flex space-x-2 w-full max-w-[240px]">
              <a href={qrUrl} download="StallEase_QR.png" target="_blank" className="flex-1 bg-white text-indigo-700 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest">Download</a>
              <button onClick={() => setShowQR(false)} className="px-4 py-3 bg-indigo-500/30 text-white rounded-xl font-black text-[9px] uppercase">Close</button>
            </div>
          </div>
          <i className="fas fa-store absolute -bottom-4 -right-4 text-white/10 text-9xl"></i>
        </section>
      )}

      {/* ITEM FORM */}
      <section className={`bg-white p-5 rounded-[2rem] border transition-all ${editingId ? 'border-blue-500 shadow-blue-50 ring-4 ring-blue-50/50' : 'border-gray-100 shadow-sm'}`}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-black text-sm text-gray-800 flex items-center">
            <span className={`w-8 h-8 ${editingId ? 'bg-blue-600' : 'bg-orange-500'} text-white rounded-xl flex items-center justify-center mr-2 shadow-sm`}>
              <i className={`fas ${editingId ? 'fa-pen' : 'fa-plus'} text-xs`}></i>
            </span>
            {editingId ? 'Edit Dish' : 'New Creation'}
          </h2>
          {editingId && (
            <button onClick={cancelEdit} className="text-[9px] font-black uppercase text-red-400 hover:text-red-500 border border-red-50 px-3 py-1 rounded-full transition-colors">
              Cancel
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Item Name</label>
            <input 
              type="text" placeholder="e.g. Peri Peri Fries" 
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
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Photo Link</label>
            <div className="flex gap-2 mb-3">
              <input 
                type="text" placeholder="URL or Search below..." 
                className="flex-1 p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-[10px] font-bold"
                value={newItem.image}
                onChange={e => setNewItem({...newItem, image: e.target.value})}
              />
              <button 
                onClick={searchImageOnline}
                disabled={isSearchingImage}
                className="bg-gray-900 text-white px-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all"
              >
                {isSearchingImage ? <i className="fas fa-spinner fa-spin"></i> : 'AI Link'}
              </button>
            </div>
            {newItem.image && (
              <div className="flex flex-col items-center py-2">
                <div className="relative group w-40 aspect-square overflow-hidden rounded-3xl border-2 border-dashed border-gray-100 p-1 bg-white shadow-inner">
                  <img src={newItem.image} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 rounded-2xl">
                    <button onClick={openCropper} className="bg-white text-black font-black w-full py-2 rounded-xl text-[8px] uppercase tracking-widest mb-2 shadow-lg">Adjust View</button>
                    <button onClick={() => setNewItem({...newItem, image: ''})} className="bg-red-500 text-white w-full py-2 rounded-xl font-black text-[8px] uppercase tracking-widest">Remove</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleSave}
            className={`w-full text-white font-black py-4 rounded-[1.2rem] shadow-xl active:scale-95 transition-all text-[11px] uppercase tracking-widest ${editingId ? 'bg-blue-600' : 'bg-orange-600'}`}
          >
            {editingId ? 'Save Changes' : 'Publish to Menu'}
          </button>
        </div>
      </section>

      {/* ITEM LIST */}
      <div className="space-y-3 px-1">
        <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
          <i className="fas fa-list mr-2"></i> Active Menu ({inventory.length})
        </h3>
        <div className="grid gap-2.5">
          {inventory.map(item => (
            <div key={item.id} className="bg-white p-2.5 rounded-[1.25rem] border border-gray-50 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <img src={item.image} alt="" className={`w-12 h-12 rounded-xl object-cover shrink-0 ${item.isAvailable ? '' : 'grayscale opacity-30'}`} />
                <div className="truncate">
                  <h4 className="font-bold text-gray-900 text-xs truncate leading-none">{item.name}</h4>
                  <p className="text-[9px] font-black text-orange-600 mt-1">₹{item.price}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                 <button onClick={() => toggleAvailability(item.id)} className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.isAvailable ? 'text-green-500 bg-green-50' : 'text-gray-300 bg-gray-50'}`}>
                   <i className={`fas ${item.isAvailable ? 'fa-eye' : 'fa-eye-slash'} text-[10px]`}></i>
                 </button>
                 <button onClick={() => startEdit(item)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-500 rounded-lg">
                    <i className="fas fa-edit text-[10px]"></i>
                 </button>
                 <button onClick={() => deleteItem(item.id)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-lg">
                    <i className="fas fa-trash text-[10px]"></i>
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECURITY PANEL */}
      <section className="mt-12 bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
            <i className="fas fa-lock mr-2"></i> Private Access Settings
          </h3>
          <button onClick={() => setShowSecurity(!showSecurity)} className="text-[9px] font-black uppercase text-indigo-600">
            {showSecurity ? 'Minimize' : 'Configure Security'}
          </button>
        </div>

        {showSecurity && (
          <div className="space-y-10 animate-fade-in">
             <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Change Login PIN (6-Digits)</label>
                <div className="flex space-x-2">
                  <input 
                    type="password" 
                    maxLength={6}
                    placeholder="Set New PIN" 
                    className="flex-1 p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-center"
                    value={newPinInput}
                    onChange={e => setNewPinInput(e.target.value)}
                  />
                  <button onClick={handleChangePin} className="bg-indigo-600 text-white px-5 rounded-2xl font-black text-[9px] uppercase tracking-widest">Update</button>
                </div>
             </div>

             <div className="pt-6 border-t border-gray-50">
                <div className="mb-4">
                  <h4 className="text-[10px] font-black text-gray-900 uppercase mb-1">Discord OTP Recovery</h4>
                  <p className="text-[8px] text-gray-400 font-bold uppercase leading-relaxed">OTP codes will be sent strictly to this URL. Never shared on-screen.</p>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-[8px] font-black text-gray-300 uppercase absolute left-4 top-1.5">Discord Webhook URL</label>
                    <input 
                      type="text" 
                      placeholder="https://discord.com/api/webhooks/..." 
                      className="w-full pt-6 pb-2 px-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-[10px]"
                      value={newWebhookInput}
                      onChange={e => setNewWebhookInput(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <label className="text-[8px] font-black text-gray-300 uppercase absolute left-4 top-1.5">Secret Question</label>
                      <input 
                        type="text" 
                        placeholder="e.g. My favorite food?" 
                        className="w-full pt-6 pb-2 px-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs"
                        value={newQuestionInput}
                        onChange={e => setNewQuestionInput(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <label className="text-[8px] font-black text-gray-300 uppercase absolute left-4 top-1.5">Answer</label>
                      <input 
                        type="text" 
                        placeholder="Answer..." 
                        className="w-full pt-6 pb-2 px-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs"
                        value={newAnswerInput}
                        onChange={e => setNewAnswerInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleUpdateSecurity}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                  >
                    Save All Security Changes
                  </button>
                </div>
             </div>
          </div>
        )}
      </section>

      {/* CROPPER */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm flex flex-col items-center space-y-6">
            <h2 className="text-white font-black text-lg uppercase">Adjust Photo</h2>
            <div 
              className="relative w-64 aspect-square bg-gray-900 overflow-hidden rounded-3xl ring-2 ring-white/10"
              onMouseDown={(e:any) => { setIsDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); }}
              onMouseMove={(e:any) => { if(isDragging) setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }}
              onMouseUp={() => setIsDragging(false)}
              onTouchStart={(e:any) => { setIsDragging(true); setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y }); }}
              onTouchMove={(e:any) => { if(isDragging) setOffset({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y }); }}
              onTouchEnd={() => setIsDragging(false)}
            >
              <canvas ref={canvasRef} width={600} height={600} className="w-full h-full object-contain" />
            </div>
            <div className="w-full px-6 space-y-6">
              <input type="range" min="1" max="5" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-orange-500" />
              <div className="flex gap-4">
                <button onClick={() => setIsCropModalOpen(false)} className="flex-1 py-3 text-white/40 font-black text-[9px] uppercase">Cancel</button>
                <button onClick={saveCrop} className="flex-[2] bg-orange-600 text-white font-black py-3 rounded-xl shadow-lg text-[9px] uppercase">Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerInventory;