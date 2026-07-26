import React, { useState, useRef } from 'react';
import { Package, Plus, Search, Edit2, Trash2, X, Save, Upload, Link as LinkIcon } from 'lucide-react';
import { uploadImage } from '../../services/upload';
import { Product, Category, ProductType } from '../../types';
import { formatPrice, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../../contexts/DataContext';

export default function AdminProducts() {
  const { products, addProduct, editProduct, removeProduct } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newProduct: Omit<Product, 'id'> & { id?: string } = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as Category,
      salePrice: Number(formData.get('salePrice')) || undefined,
      rentalPrice: Number(formData.get('rentalPrice')) || undefined,
      securityDeposit: Number(formData.get('securityDeposit')) || undefined,
      productType: formData.get('productType') as ProductType,
      fabric: (formData.get('fabric') as string) || undefined,
      designer: (formData.get('designer') as string) || undefined,
      sizes: (formData.get('sizes') as string).split(',').map(s => s.trim()).filter(Boolean),
      style: (formData.get('style') as string).split(',').map(s => s.trim()).filter(Boolean),
      images: productImages.length > 0 ? productImages : ['https://images.unsplash.com/photo-1594462250122-b130a08f2441?auto=format&fit=crop&w=1200&q=80'],
      tags: (formData.get('tags') as string).split(',').map(s => s.trim()).filter(s => s !== ''),
      color: [],
      isFeatured: formData.get('isFeatured') === 'on',
      isNew: formData.get('isNew') === 'on',
    };

    try {
      if (editingProduct) {
        await editProduct(editingProduct.id, newProduct);
      } else {
        await addProduct(newProduct);
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this piece from the collection?')) {
      try {
        await removeProduct(id);
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-ivory p-8 border border-stone-200">
        <div>
          <h2 className="font-heading text-2xl text-stone-800 tracking-wide uppercase">Collection Inventory</h2>
          <p className="text-[10px] tracking-[0.3em] text-stone-400 uppercase mt-1">Manage physical & digital assets</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setProductImages([]);
            setIsFormOpen(true);
          }}
          className="btn-luxury flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Design
        </button>
      </div>

      <div className="bg-ivory border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text"
              placeholder="Search by name, category, or fabric..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 text-xs tracking-widest outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-8 py-4 text-[10px] tracking-widest text-stone-400 uppercase font-bold">Image</th>
                <th className="px-8 py-4 text-[10px] tracking-widest text-stone-400 uppercase font-bold">Design Details</th>
                <th className="px-8 py-4 text-[10px] tracking-widest text-stone-400 uppercase font-bold">Category</th>
                <th className="px-8 py-4 text-[10px] tracking-widest text-stone-400 uppercase font-bold">Tags</th>
                <th className="px-8 py-4 text-[10px] tracking-widest text-stone-400 uppercase font-bold">Sale/Rent</th>
                <th className="px-8 py-4 text-[10px] tracking-widest text-stone-400 uppercase font-bold">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="w-16 h-20 bg-stone-100 overflow-hidden border border-stone-200">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <p className="text-xs font-bold text-stone-800 uppercase tracking-widest">{p.name}</p>
                    <p className="text-[9px] text-stone-400 mt-1 italic">{p.fabric}</p>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-[10px] tracking-widest uppercase text-stone-500 font-medium">{p.category}</span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex flex-wrap gap-1">
                      {p.tags?.map(tag => (
                        <span key={tag} className="text-[8px] bg-stone-100 text-stone-500 px-1.5 py-0.5 tracking-tighter uppercase">
                          {tag}
                        </span>
                      )) || <span className="text-[8px] text-stone-300 italic">No tags</span>}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="space-y-1">
                      {p.salePrice && <p className="text-[10px] font-bold text-stone-800">{formatPrice(p.salePrice)}</p>}
                      {p.rentalPrice && <p className="text-[10px] text-gold uppercase tracking-widest">Rent: {formatPrice(p.rentalPrice)}</p>}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingProduct(p);
                          setProductImages(p.images || []);
                          setIsFormOpen(true);
                        }}
                        className="p-2 border border-stone-200 text-stone-400 hover:text-gold hover:border-gold transition-all"
                        aria-label="Edit product"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => deleteProduct(p.id)}
                        className="p-2 border border-stone-200 text-stone-400 hover:text-rose-500 hover:border-rose-200 transition-all"
                        aria-label="Delete product"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-ivory w-full max-w-4xl max-h-[90vh] overflow-hidden relative shadow-2xl border border-stone-200 flex flex-col"
              role="dialog"
              aria-modal="true"
            >
              <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                <h3 className="font-heading text-xl text-stone-800 tracking-wide uppercase">
                  {editingProduct ? 'Edit Artisan Piece' : 'Catalogue Entry'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} aria-label="Close" className="text-stone-400 hover:text-stone-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-grow overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Artistry Details</h4>
                    <InputField label="Piece Name" name="name" defaultValue={editingProduct?.name} required />
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Description</label>
                      <textarea 
                        name="description" 
                        defaultValue={editingProduct?.description}
                        required
                        className="w-full bg-stone-50 border border-stone-100 p-4 text-[11px] tracking-widest outline-none focus:border-gold transition-colors resize-none h-32"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Category" name="category" defaultValue={editingProduct?.category} required />
                      <InputField label="Designer" name="designer" defaultValue={editingProduct?.designer || 'Riman Atelier'} />
                    </div>
                  </div>

                  {/* Pricing & Types */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Investment & Types</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Sale Price (AED)" name="salePrice" type="number" defaultValue={editingProduct?.salePrice} />
                      <InputField label="Rental Price (AED)" name="rentalPrice" type="number" defaultValue={editingProduct?.rentalPrice} />
                    </div>
                    <InputField label="Refundable Deposit (AED)" name="securityDeposit" type="number" defaultValue={editingProduct?.securityDeposit} />
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Service Type</label>
                      <select name="productType" defaultValue={editingProduct?.productType || 'both'} className="w-full bg-stone-50 border border-stone-100 p-4 text-[11px] tracking-widest outline-none focus:border-gold cursor-pointer">
                        <option value="both">Sale & Rental</option>
                        <option value="sale">Exclusive Sale</option>
                        <option value="rent">Boutique Rental</option>
                      </select>
                    </div>

                    <InputField label="Fabric Composition" name="fabric" defaultValue={editingProduct?.fabric} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Configuration</h4>
                     <InputField label="Available Sizes (comma separated)" name="sizes" defaultValue={editingProduct?.sizes.join(', ') || 'XS, S, M, L, XL'} />
                     <InputField label="Style Tags (comma separated)" name="style" defaultValue={editingProduct?.style.join(', ') || 'Modern, Luxury'} />
                     <InputField label="Product Tags (comma separated)" name="tags" defaultValue={editingProduct?.tags?.join(', ') || ''} placeholder="e.g. Vintage, Hand-stitched, Cathedral" />
                  </div>
                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Flags</h4>
                     <div className="flex items-center gap-8 pt-4">
                        <Checkbox label="Featured Design" name="isFeatured" defaultChecked={editingProduct?.isFeatured} />
                        <Checkbox label="New Arrival" name="isNew" defaultChecked={editingProduct?.isNew} />
                     </div>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Images</h4>
                  <div className="flex flex-wrap gap-3">
                    {productImages.map((url, i) => (
                      <div key={i} className="relative group w-20 h-24 bg-stone-100 border border-stone-200 overflow-hidden">
                        <img src={url} alt={`Product image ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setProductImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <div className="w-20 h-24 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 gap-1 cursor-pointer hover:border-gold/50 transition-colors relative" onClick={() => document.getElementById('product-image-upload')?.click()}>
                      <Plus className="w-4 h-4" />
                      <span className="text-[7px] tracking-widest uppercase">Upload</span>
                    </div>
                  </div>
                  <input
                    id="product-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      try {
                        const url = await uploadImage(file);
                        setProductImages(prev => [...prev, url]);
                      } catch (err) {
                        console.error('Upload failed:', err);
                      } finally {
                        setIsUploading(false);
                        e.target.value = '';
                      }
                    }}
                  />
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={e => setImageUrlInput(e.target.value)}
                      placeholder="Paste image URL..."
                      className="flex-1 bg-stone-50 border border-stone-100 p-3 text-[10px] tracking-widest outline-none focus:border-gold transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (imageUrlInput.trim()) {
                          setProductImages(prev => [...prev, imageUrlInput.trim()]);
                          setImageUrlInput('');
                        }
                      }}
                      disabled={!imageUrlInput.trim()}
                      className="px-4 py-3 bg-stone-800 text-white text-[10px] tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-40 flex items-center gap-2"
                    >
                      <LinkIcon className="w-3 h-3" /> Add
                    </button>
                  </div>
                  {isUploading && <p className="text-[9px] text-stone-400 italic">Uploading image...</p>}
                </div>

                <div className="p-8 bg-onyx border-t border-stone-100 flex justify-end gap-4 -mx-8 -mb-8 mt-12">
                   <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)}
                    className="px-8 py-3 text-[10px] tracking-widest uppercase text-stone-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-gold text-white px-10 py-3 text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-gold-dark transition-all flex items-center gap-2"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )} Finalize Selection
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  placeholder?: string;
}

function InputField({ label, name, type = "text", defaultValue, required, placeholder }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">{label}</label>
      <input 
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full bg-stone-50 border border-stone-100 p-4 text-[11px] tracking-widest outline-none focus:border-gold transition-colors"
      />
    </div>
  );
}

interface CheckboxProps {
  label: string;
  name: string;
  defaultChecked?: boolean;
}

function Checkbox({ label, name, defaultChecked }: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input 
          type="checkbox" 
          name={name} 
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <div className="w-5 h-5 border border-stone-300 bg-white group-hover:border-gold transition-all peer-checked:bg-gold peer-checked:border-gold" />
        <Plus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
      </div>
      <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">{label}</span>
    </label>
  );
}
