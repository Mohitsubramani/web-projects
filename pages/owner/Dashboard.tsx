import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { Order, OrderStatus } from '../../types';

interface DashboardProps {
  orders: Order[];
  updateOrder: (id: string, updates: Partial<Order>) => void;
  addOrder: (order: Order) => void;
}

const OwnerDashboard: React.FC<DashboardProps> = ({ orders, updateOrder, addOrder }) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const pendingConfirmation = orders.filter(o => o.status === OrderStatus.PAID_PENDING_CONFIRMATION);
  const preparing = orders.filter(o => o.status === OrderStatus.PREPARING).sort((a, b) => (a.token || 0) - (b.token || 0));
  const readyForPickup = orders.filter(o => o.status === OrderStatus.COMPLETED).sort((a, b) => (a.token || 0) - (b.token || 0));

  const handleConfirm = (orderId: string) => {
    setProcessingId(orderId);
    updateOrder(orderId, { status: OrderStatus.PREPARING });
    setTimeout(() => setProcessingId(null), 100);
  };

  const startScanning = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(scanFrame);
      }
    } catch (e) {
      alert("Camera access denied! Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const scanFrame = () => {
    if (!isScanning) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
        
        if (code) {
          try {
            const orderData = JSON.parse(code.data);
            if (orderData.id) {
              const newOrder: Order = {
                id: orderData.id,
                items: orderData.items.map((i: any) => ({ 
                  id: i.n,
                  name: i.n, 
                  quantity: i.q, 
                  price: i.p, 
                  isAvailable: true, 
                  description: '', 
                  category: '',
                  image: ''
                })),
                totalPrice: orderData.t,
                timestamp: orderData.ts,
                paymentMethod: orderData.pm,
                status: OrderStatus.PAID_PENDING_CONFIRMATION
              };
              
              if (!orders.some(o => o.id === newOrder.id)) {
                addOrder(newOrder);
                alert("Order synced! Verify payment now.");
              } else {
                alert("Order already exists!");
              }
              stopScanning();
              return;
            }
          } catch (e) {
            console.error("Invalid QR code", e);
          }
        }
      }
    }
    requestAnimationFrame(scanFrame);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 px-1">
      <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Kitchen</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Order Flow Management</p>
        </div>
        <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-50">
          <div className="text-center px-4">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Cooking</span>
            <span className="text-xl font-black text-orange-600">{preparing.length}</span>
          </div>
          <div className="h-8 w-px bg-gray-100"></div>
          <div className="text-center px-4">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Pickup</span>
            <span className="text-xl font-black text-green-600">{readyForPickup.length}</span>
          </div>
          <button 
            onClick={startScanning}
            className="ml-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center"
          >
            <i className="fas fa-qrcode mr-2"></i> Scan Order
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-4">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Verification ({pendingConfirmation.length})
            </h2>
          </div>
          
          <div className="space-y-4">
            {pendingConfirmation.length === 0 && (
              <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] py-20 text-center px-6">
                <p className="text-gray-300 font-black uppercase tracking-widest text-[8px]">Scan a customer QR to begin</p>
              </div>
            )}
            
            {pendingConfirmation.map(order => (
              <div key={order.id} className="bg-white border border-blue-50 rounded-[2rem] p-6 shadow-xl shadow-blue-50/20 animate-in slide-in-from-left-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
                      {order.paymentMethod}
                    </span>
                    <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest block leading-none">ID: {order.id.slice(-6).toUpperCase()}</h3>
                  </div>
                  <span className="text-xl font-black text-gray-900 leading-none">₹{order.totalPrice}</span>
                </div>
                
                <div className="space-y-1.5 mb-8 text-xs font-bold text-gray-700 border-l-2 border-gray-50 pl-4 py-1">
                  {order.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{i.quantity}x {i.name}</span>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <button 
                    disabled={processingId === order.id}
                    onClick={() => handleConfirm(order.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition-all text-[10px] uppercase tracking-widest active:scale-95"
                  >
                    {processingId === order.id ? <i className="fas fa-spinner fa-spin"></i> : "Approve & Cook"}
                  </button>
                  <button 
                    onClick={() => updateOrder(order.id, { status: OrderStatus.CANCELLED })}
                    className="w-12 bg-red-50 text-red-400 rounded-xl flex items-center justify-center"
                  >
                    <i className="fas fa-trash-alt text-[10px]"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-8 space-y-10">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 flex items-center mb-6 px-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
              Chef's List
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preparing.map(order => (
                <div key={order.id} className="bg-white border border-gray-100 shadow-sm rounded-[2rem] p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-orange-600 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-orange-100">
                      <span className="text-[6px] font-black uppercase leading-none opacity-60">Token</span>
                      <span className="text-2xl font-black leading-none mt-1">#{order.token}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[8px] font-black text-gray-300 uppercase block mb-1">Incoming</span>
                       <span className="text-xl font-black text-gray-900 leading-none">₹{order.totalPrice}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5 mb-6 border-l-2 border-orange-50 pl-4">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="text-xs font-bold text-gray-700">{i.quantity}x {i.name}</div>
                    ))}
                  </div>
                  <button 
                    onClick={() => updateOrder(order.id, { status: OrderStatus.COMPLETED })}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95"
                  >
                    Mark Ready
                  </button>
                </div>
              ))}
              {preparing.length === 0 && <p className="col-span-full py-16 text-center text-gray-200 font-black uppercase text-[8px] border-2 border-dashed border-gray-100 rounded-[2.5rem]">Kitchen Idle</p>}
            </div>
          </div>

          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 flex items-center mb-6 px-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Pickup Counter
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readyForPickup.map(order => (
                <div key={order.id} className="bg-white border-2 border-green-50 shadow-md rounded-[2rem] p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-green-600 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-green-100">
                      <span className="text-[6px] font-black uppercase leading-none opacity-60">Token</span>
                      <span className="text-2xl font-black leading-none mt-1">#{order.token}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-green-600 text-[8px] font-black uppercase block mb-1">Ready</span>
                       <span className="text-xl font-black text-gray-900 leading-none">₹{order.totalPrice}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5 mb-6 border-l-2 border-green-50 pl-4">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="text-xs font-bold text-gray-700">{i.quantity}x {i.name}</div>
                    ))}
                  </div>
                  <button 
                    onClick={() => updateOrder(order.id, { status: OrderStatus.DELIVERED })}
                    className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                  >
                    Handed Over
                  </button>
                </div>
              ))}
              {readyForPickup.length === 0 && <p className="col-span-full py-10 text-center text-gray-200 font-black uppercase text-[8px]">Pickup counter clear</p>}
            </div>
          </div>
        </section>
      </div>

      {isScanning && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm flex flex-col items-center">
            <h2 className="text-white font-black text-lg uppercase tracking-tight mb-2">Scan Order</h2>
            <p className="text-white/40 text-[9px] uppercase font-bold tracking-[0.2em] mb-8">Scan the Verification QR on Customer's phone</p>
            
            <div className="relative w-full aspect-square bg-gray-900 rounded-[2.5rem] overflow-hidden border-4 border-blue-500/20 shadow-2xl">
               <video ref={videoRef} className="w-full h-full object-cover" />
               <canvas ref={canvasRef} className="hidden" />
               
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-white/50 rounded-3xl relative">
                     <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                     <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                     <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                     <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                     <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500/50 animate-scan"></div>
                  </div>
               </div>
            </div>
            
            <button 
              onClick={stopScanning}
              className="mt-12 bg-white/10 text-white px-8 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-white/20 transition-all"
            >
              Cancel Scan
            </button>
          </div>
          
          <style>{`
            @keyframes scan {
              0% { top: 0%; opacity: 0; }
              50% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            .animate-scan {
              position: absolute;
              animation: scan 2s linear infinite;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;