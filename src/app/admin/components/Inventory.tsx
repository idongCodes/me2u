"use client";

import React, { useState, useEffect } from "react";
import { 
  getShopItems, 
  createShopItem, 
  updateShopItem, 
  deleteShopItem, 
  updateItemStatus,
  restoreShopItem
} from "@/app/actions/shop-items";
import { 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  X, 
  Image as ImageIcon,
  AlertCircle,
  Tag,
  DollarSign,
  Search
} from "lucide-react";
import { useModal } from "@/components/ModalProvider";
import { useToast } from "@/components/ToastProvider";
import Image from "next/image";

interface ShopItemData {
  _id?: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  status: "available" | "reserved" | "sold";
}

export default function Inventory() {
  const modal = useModal();
  const toast = useToast();
  
  const [items, setItems] = useState<ShopItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Omit<ShopItemData, '_id'>>({
    name: "",
    price: 0,
    description: "",
    images: [""],
    status: "available"
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getShopItems();
      setItems(data);
    } catch (err) {
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      price: 0,
      description: "",
      images: [""],
      status: "available"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ShopItemData) => {
    setEditingId(item._id!);
    setFormData({
      name: item.name,
      price: item.price,
      description: item.description,
      images: item.images.length > 0 ? [...item.images] : [""],
      status: item.status
    });
    setIsModalOpen(true);
  };

  const handleAddImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ""] }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleRemoveImageField = (index: number) => {
    if (formData.images.length === 1) return;
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Filter out empty image strings
    const cleanData = {
      ...formData,
      images: formData.images.filter(img => img.trim() !== "")
    };

    try {
      if (editingItem) {
        const result = await updateShopItem(editingItem, cleanData);
        if (result.success) {
          await fetchItems();
          setIsModalOpen(false);
        } else {
          alert(result.error || "Failed to update item");
        }
      } else {
        const result = await createShopItem(cleanData);
        if (result.success) {
          await fetchItems();
          setIsModalOpen(false);
        } else {
          alert("Failed to create item");
        }
      }
    } catch (err) {
      alert("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: ShopItemData) => {
    const confirmed = await modal.confirm({
      type: "danger",
      title: "Delete Item",
      message: `Are you sure you want to delete "${item.name}"? This will hide it from the shop instantly.`,
      confirmLabel: "Delete Forever",
    });

    if (!confirmed) return;

    try {
      await deleteShopItem(item._id!);
      await fetchItems();
      toast.showUndo(`${item.name} deleted`, async () => {
        await restoreShopItem(item._id!);
        await fetchItems();
      });
    } catch (err) {
      modal.alert({ type: "danger", title: "Error", message: "Failed to delete item." });
    }
  };

  const handleStatusToggle = async (item: ShopItemData, newStatus: "available" | "sold") => {
    try {
      await updateItemStatus(item._id!, newStatus);
      await fetchItems();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-skyblue" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shop Inventory</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-skyblue outline-none transition-all w-full sm:w-64"
            />
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-black dark:bg-skyblue text-white dark:text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-skyblue hover:text-black dark:hover:bg-white transition-all shadow-md active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            Add Item
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-gray-50 dark:bg-gray-900/50 p-12 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-center space-y-4">
            <ImageIcon className="mx-auto text-gray-300" size={48} />
            <p className="text-gray-500 font-medium">No items found in your inventory.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item._id} 
              className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group ${
                item.status === 'sold' ? 'opacity-75' : ''
              }`}
            >
              {/* Image Preview */}
              <div className="relative aspect-video bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                {item.images.length > 0 ? (
                  <Image 
                    src={item.images[0]} 
                    alt={item.name} 
                    fill 
                    className={`object-contain p-4 transition-transform group-hover:scale-105 ${item.status === 'sold' ? 'grayscale' : ''}`}
                  />
                ) : (
                  <ImageIcon size={32} className="text-gray-300" />
                )}
                
                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 ${
                    item.status === 'available' ? 'bg-green-500 text-white' :
                    item.status === 'reserved' ? 'bg-skyblue text-black' :
                    'bg-gray-500 text-white'
                  }`}>
                    {item.status === 'available' && <Tag size={10} />}
                    {item.status === 'reserved' && <Loader2 size={10} className="animate-spin" />}
                    {item.status === 'sold' && <CheckCircle2 size={10} />}
                    {item.status}
                  </span>
                </div>

                {/* Quick Toggle Sold */}
                <button
                  onClick={() => handleStatusToggle(item, item.status === 'sold' ? 'available' : 'sold')}
                  className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all active:scale-90 ${
                    item.status === 'sold' 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-white/90 text-gray-500 hover:text-black backdrop-blur-md'
                  }`}
                  title={item.status === 'sold' ? "Mark as Available" : "Mark as Sold"}
                >
                  <CheckCircle2 size={18} />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-white leading-tight line-clamp-1">{item.name}</h3>
                  <span className="text-skyblue font-black tracking-tight">${item.price}</span>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex gap-2 mt-auto">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-skyblue dark:hover:text-black transition-all"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex-shrink-0 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-950 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-950 sticky top-0 z-10">
              <h3 className="text-xl font-black tracking-tighter">
                {editingItem ? "Edit Item" : "Add New Item"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Item Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-skyblue text-sm font-bold"
                    placeholder="e.g. Vintage Denim Jacket"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Price ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-skyblue text-sm font-bold"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-skyblue text-sm font-medium leading-relaxed"
                    placeholder="Describe the item condition, size, etc."
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Image URLs</label>
                    <button 
                      type="button" 
                      onClick={handleAddImageField}
                      className="text-skyblue text-[10px] font-black uppercase tracking-widest hover:underline"
                    >
                      Add Image
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="url"
                          value={img}
                          onChange={e => handleImageChange(idx, e.target.value)}
                          className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-skyblue text-xs font-medium"
                          placeholder="https://images.unsplash.com/..."
                        />
                        <button 
                          type="button"
                          onClick={() => handleRemoveImageField(idx)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-skyblue text-sm font-bold appearance-none"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-black dark:bg-skyblue text-white dark:text-black shadow-lg hover:shadow-skyblue/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    editingItem ? "Save Changes" : "Create Item"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
