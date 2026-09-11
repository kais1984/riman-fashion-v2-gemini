import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, Link as LinkIcon, ArrowUp, ArrowDown, CalendarPlus, Upload } from 'lucide-react';
import { uploadImage } from '../../services/upload';
import { Product, Category, ProductType } from '../../types';
import { formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { fetchProductBookings, createRentalBooking, deleteRentalBooking, type RentalBooking } from '../../services/rentals';

const CATEGORIES: Category[] = ['Bridal Gown', 'Evening Dress', 'Accessory', 'Fine Jewelry'];

const SILHOUETTES = ['Ballgown', 'A-Line', 'Mermaid', 'Column', 'Kaftan', 'One Size'];

export default function AdminProducts() {
  const { products, addProduct, editProduct, removeProduct, reorderProducts } = useData();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [productBookings, setProductBookings] = useState<RentalBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const hasActiveFilters = searchTerm.trim() !== '' || categoryFilter !== 'all';

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newProduct: Omit<Product, 'id'> & { id?: string } = {
      ...(editingProduct || {}),
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
      color: (formData.get('color') as string).split(',').map(s => s.trim()).filter(Boolean),
      silhouette: (formData.get('silhouette') as string) || undefined,
      collectionYear: Number(formData.get('collectionYear')) || undefined,
      videoUrl: ((formData.get('videoUrl') as string) || '').trim() || undefined,
      images: productImages.length > 0 ? productImages : (editingProduct?.images || ['/images/journal-rental.jpg']),
      tags: (formData.get('tags') as string).split(',').map(s => s.trim()).filter(s => s !== ''),
      isFeatured: formData.get('isFeatured') === 'on',
      isNew: formData.get('isNew') === 'on',
    };

    try {
      if (editingProduct) {
        await editProduct(editingProduct.id, newProduct);
      } else {
        await addProduct(newProduct as Product);
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const loadBookings = async (productId: string) => {
    setIsLoadingBookings(true);
    try {
      setProductBookings(await fetchProductBookings(productId));
    } catch {
      setProductBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const addBlock = async () => {
    if (!editingProduct || !blockStart || !blockEnd) return;
    try {
      await createRentalBooking({
        product_id: editingProduct.id,
        customer_name: 'Atelier Hold',
        customer_email: 'atelier@rimanfashion.com',
        start_date: blockStart,
        end_date: blockEnd,
        status: 'blocked',
      });
      await loadBookings(editingProduct.id);
      setBlockStart('');
      setBlockEnd('');
      addToast({ type: 'success', title: 'Dates blocked', message: 'Hold period added to calendar.' });
    } catch (err) {
      console.error('Failed to add block:', err);
      addToast({ type: 'error', title: 'Could not block dates', message: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  const removeBooking = async (id: string) => {
    if (!editingProduct) return;
    try {
      await deleteRentalBooking(id);
      await loadBookings(editingProduct.id);
      addToast({ type: 'success', title: 'Removed', message: 'Booking hold deleted.' });
    } catch (err) {
      console.error('Failed to delete booking:', err);
      addToast({ type: 'error', title: 'Could not remove', message: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  const handleBulkImport = async () => {
    const urls = importInput.split('\n').map(s => s.trim()).filter(Boolean);
    const total = urls.length + importFiles.length;
    if (total === 0) return;
    setIsImporting(true);
    try {
      let index = 0;
      for (const url of urls) {
        index++;
        await addProduct({
          id: `${Date.now()}-${index}`,
          name: `New Design ${index}`,
          description: 'Awaiting curation — details to be added.',
          category: 'Bridal Gown',
          productType: 'both',
          salePrice: 10000,
          rentalPrice: 1000,
          securityDeposit: 2000,
          images: [url],
          style: [],
          color: [],
          sizes: ['XS', 'S', 'M', 'L', 'XL'],
          designer: 'Riman Atelier',
          collectionYear: new Date().getFullYear(),
          isNew: true,
        });
      }
      for (const file of importFiles) {
        index++;
        const url = await uploadImage(file);
        await addProduct({
          id: `${Date.now()}-${index}`,
          name: `New Design ${index}`,
          description: 'Awaiting curation — details to be added.',
          category: 'Bridal Gown',
          productType: 'both',
          salePrice: 10000,
          rentalPrice: 1000,
          securityDeposit: 2000,
          images: [url],
          style: [],
          color: [],
          sizes: ['XS', 'S', 'M', 'L', 'XL'],
          designer: 'Riman Atelier',
          collectionYear: new Date().getFullYear(),
          isNew: true,
        });
      }
      setIsImportOpen(false);
      setImportInput('');
      setImportFiles([]);
      addToast({ type: 'success', title: 'Imported', message: `${total} products created as drafts.` });
    } catch (err) {
      console.error('Bulk import failed:', err);
      addToast({ type: 'error', title: 'Import failed', message: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsImporting(false);
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

  const moveProduct = async (id: string, direction: -1 | 1) => {
    const orderedIds = products.map(p => p.id);
    const index = orderedIds.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= orderedIds.length) return;
    [orderedIds[index], orderedIds[target]] = [orderedIds[target], orderedIds[index]];
    try {
      await reorderProducts(orderedIds);
    } catch (err) {
      console.error('Failed to reorder products:', err);
    }
  };

  const filteredProducts = products.filter(p =>
    (categoryFilter === 'all' || p.category === categoryFilter) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-ivory p-8 border border-stone-200">
        <div>
          <h2 className="font-heading text-2xl text-stone-800 tracking-wide uppercase">Collection Inventory</h2>
          <p className="text-micro tracking-[0.3em] text-stone-600 uppercase mt-1">Arrange, edit & manage the collection order</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setProductImages([]);
            setProductBookings([]);
            setIsFormOpen(true);
          }}
          className="btn-luxury flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Design
        </button>
        <button
          onClick={() => setIsImportOpen(true)}
          className="btn-luxury-outline flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> Bulk Import
        </button>
      </div>

      <div className="bg-ivory border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-grow max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 text-xs tracking-widest outline-none focus:border-gold transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-100 px-4 py-3 text-micro tracking-widest uppercase outline-none focus:border-gold cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <p className="text-micro text-stone-500 italic tracking-widest">Clear filters to reorder</p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-4 py-4 text-micro tracking-widest text-stone-600 uppercase font-bold">Order</th>
                <th className="px-8 py-4 text-micro tracking-widest text-stone-600 uppercase font-bold">Image</th>
                <th className="px-8 py-4 text-micro tracking-widest text-stone-600 uppercase font-bold">Design Details</th>
                <th className="px-8 py-4 text-micro tracking-widest text-stone-600 uppercase font-bold">Category</th>
                <th className="px-8 py-4 text-micro tracking-widest text-stone-600 uppercase font-bold">Tags</th>
                <th className="px-8 py-4 text-micro tracking-widest text-stone-600 uppercase font-bold">Sale/Rent</th>
                <th className="px-8 py-4 text-micro tracking-widest text-stone-600 uppercase font-bold">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => {
                const position = products.findIndex(x => x.id === p.id);
                return (
                <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-micro font-bold text-stone-500 w-6 text-center">{position + 1}</span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveProduct(p.id, -1)}
                          disabled={hasActiveFilters || position === 0}
                          className="p-1 border border-stone-200 text-stone-400 hover:text-gold hover:border-gold transition-all disabled:opacity-30 disabled:hover:text-stone-400 disabled:hover:border-stone-200"
                          aria-label={`Move ${p.name} up`}
                          title={hasActiveFilters ? 'Clear filters to reorder' : 'Move up'}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveProduct(p.id, 1)}
                          disabled={hasActiveFilters || position === products.length - 1}
                          className="p-1 border border-stone-200 text-stone-400 hover:text-gold hover:border-gold transition-all disabled:opacity-30 disabled:hover:text-stone-400 disabled:hover:border-stone-200"
                          aria-label={`Move ${p.name} down`}
                          title={hasActiveFilters ? 'Clear filters to reorder' : 'Move down'}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="w-16 h-20 bg-stone-100 overflow-hidden border border-stone-200">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <p className="text-xs font-bold text-stone-800 uppercase tracking-widest">{p.name}</p>
                    <p className="text-micro text-stone-600 mt-1 italic">{p.fabric}</p>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-micro tracking-widest uppercase text-stone-600 font-medium">{p.category}</span>
                    {p.silhouette && (
                      <p className="text-micro text-stone-500 mt-1">{p.silhouette}</p>
                    )}
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(p.color?.length ? p.color : p.tags)?.map(tag => (
                        <span key={tag} className="text-micro bg-stone-100 text-stone-600 px-1.5 py-0.5 tracking-tighter uppercase">
                          {tag}
                        </span>
                      )) || <span className="text-micro text-stone-500 italic">No tags</span>}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="space-y-1">
                      {p.salePrice && <p className="text-micro font-bold text-stone-800">{formatPrice(p.salePrice)}</p>}
                      {p.rentalPrice && <p className="text-micro text-gold uppercase tracking-widest">Rent: {formatPrice(p.rentalPrice)}</p>}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setProductImages(p.images || []);
                          setIsFormOpen(true);
                          loadBookings(p.id);
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
                );
              })}
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
                    <h4 className="text-micro font-black text-stone-600 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Artistry Details</h4>
                    <InputField label="Piece Name" name="name" defaultValue={editingProduct?.name} required />
                    <div className="flex flex-col gap-2">
                      <label className="text-micro uppercase tracking-widest text-stone-600 font-bold">Description</label>
                      <textarea
                        name="description"
                        defaultValue={editingProduct?.description}
                        required
                        className="w-full bg-stone-50 border border-stone-100 p-4 text-micro tracking-widest outline-none focus:border-gold transition-colors resize-none h-32"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-micro uppercase tracking-widest text-stone-600 font-bold">Category</label>
                        <select name="category" defaultValue={editingProduct?.category || 'Bridal Gown'} required className="w-full bg-stone-50 border border-stone-100 p-4 text-micro tracking-widest outline-none focus:border-gold cursor-pointer">
                          {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-micro uppercase tracking-widest text-stone-600 font-bold">Silhouette</label>
                        <select name="silhouette" defaultValue={editingProduct?.silhouette || 'One Size'} className="w-full bg-stone-50 border border-stone-100 p-4 text-micro tracking-widest outline-none focus:border-gold cursor-pointer">
                          {SILHOUETTES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <InputField label="Designer" name="designer" defaultValue={editingProduct?.designer || 'Riman Atelier'} />
                  </div>

                  {/* Pricing & Types */}
                  <div className="space-y-6">
                    <h4 className="text-micro font-black text-stone-600 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Investment & Types</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Sale Price (AED)" name="salePrice" type="number" defaultValue={editingProduct?.salePrice} />
                      <InputField label="Rental Price (AED)" name="rentalPrice" type="number" defaultValue={editingProduct?.rentalPrice} />
                    </div>
                    <InputField label="Refundable Deposit (AED)" name="securityDeposit" type="number" defaultValue={editingProduct?.securityDeposit} />

                    <div className="flex flex-col gap-2">
                      <label className="text-micro uppercase tracking-widest text-stone-600 font-bold">Service Type</label>
                      <select name="productType" defaultValue={editingProduct?.productType || 'both'} className="w-full bg-stone-50 border border-stone-100 p-4 text-micro tracking-widest outline-none focus:border-gold cursor-pointer">
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
                     <h4 className="text-micro font-black text-stone-600 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Configuration</h4>
                     <InputField label="Available Sizes (comma separated)" name="sizes" defaultValue={editingProduct?.sizes.join(', ') || 'XS, S, M, L, XL'} />
                     <InputField label="Colors (comma separated)" name="color" defaultValue={editingProduct?.color?.join(', ') || ''} placeholder="e.g. Ivory, Gold" />
                     <InputField label="Style Tags (comma separated)" name="style" defaultValue={editingProduct?.style.join(', ') || 'Modern, Luxury'} />
                     <InputField label="Product Tags (comma separated)" name="tags" defaultValue={editingProduct?.tags?.join(', ') || ''} placeholder="e.g. Vintage, Hand-stitched, Cathedral" />
                  </div>
                  <div className="space-y-6">
                     <h4 className="text-micro font-black text-stone-600 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Flags & Media</h4>
                     <div className="flex items-center gap-8 pt-4">
                        <Checkbox label="Featured Design" name="isFeatured" defaultChecked={editingProduct?.isFeatured} />
                        <Checkbox label="New Arrival" name="isNew" defaultChecked={editingProduct?.isNew} />
                     </div>
                     <InputField label="Collection Year" name="collectionYear" type="number" defaultValue={editingProduct?.collectionYear || new Date().getFullYear()} />
                     <InputField label="Video URL (optional)" name="videoUrl" defaultValue={editingProduct?.videoUrl} placeholder="/assets/video.mp4 or https://..." />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-6">
                  <h4 className="text-micro font-black text-stone-600 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Images</h4>
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
                    <div className="w-20 h-24 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-600 gap-1 cursor-pointer hover:border-gold/50 transition-colors relative" onClick={() => document.getElementById('product-image-upload')?.click()}>
                      <Plus className="w-4 h-4" />
                      <span className="text-micro tracking-widest uppercase">Upload</span>
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
                      className="flex-1 bg-stone-50 border border-stone-100 p-3 text-micro tracking-widest outline-none focus:border-gold transition-colors"
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
                      className="px-4 py-3 bg-stone-800 text-white text-micro tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-40 flex items-center gap-2"
                    >
                      <LinkIcon className="w-3 h-3" /> Add
                    </button>
                  </div>
                  {isUploading && <p className="text-micro text-stone-600 italic">Uploading image...</p>}
                </div>

                {editingProduct && (
                  <div className="space-y-6 border-t border-stone-100 pt-8 mt-8">
                    <h4 className="text-micro font-black text-stone-600 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Availability Blocks</h4>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-4 flex-wrap">
                        <div className="flex-1 min-w-[180px] flex flex-col gap-2">
                          <label className="text-micro uppercase tracking-widest text-stone-600 font-bold">Block Start</label>
                          <input type="date" value={blockStart} onChange={e => setBlockStart(e.target.value)} className="w-full bg-stone-50 border border-stone-100 p-4 text-micro tracking-widest outline-none focus:border-gold transition-colors" />
                        </div>
                        <div className="flex-1 min-w-[180px] flex flex-col gap-2">
                          <label className="text-micro uppercase tracking-widest text-stone-600 font-bold">Block End</label>
                          <input type="date" value={blockEnd} onChange={e => setBlockEnd(e.target.value)} className="w-full bg-stone-50 border border-stone-100 p-4 text-micro tracking-widest outline-none focus:border-gold transition-colors" />
                        </div>
                        <button onClick={addBlock} disabled={!blockStart || !blockEnd || isLoadingBookings} className="px-6 py-4 bg-gold text-white text-micro tracking-[0.2em] font-bold uppercase hover:bg-gold-dark transition-all flex items-center gap-2 self-end" >
                          <CalendarPlus className="w-4 h-4" /> Add Block
                        </button>
                      </div>

                      {isLoadingBookings ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : productBookings.length === 0 ? (
                        <p className="text-micro text-stone-500 italic">No blocks or bookings yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {productBookings.map(b => (
                            <div key={b.id ?? Math.random().toString(36).slice(2)} className="flex items-center justify-between p-4 bg-stone-50 border border-stone-100">
                              <div className="flex flex-col gap-1">
                                <span className="text-micro font-bold text-stone-800 tracking-widest uppercase">
                                  {b.status === 'blocked' ? 'Atelier Hold' : `Booking #${(b.id ?? '').slice(0, 8)}`}
                                </span>
                                <span className="text-micro text-stone-600">
                                  {new Date(b.start_date).toLocaleDateString()} — {new Date(b.end_date).toLocaleDateString()}
                                </span>
                              </div>
                              <button
                                onClick={() => b.id && removeBooking(b.id)}
                                disabled={isLoadingBookings || !b.id}
                                className="p-2 border border-stone-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all disabled:opacity-40"
                                aria-label={b.status === 'blocked' ? 'Remove hold' : 'Cancel booking'}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-8 bg-onyx border-t border-stone-100 flex justify-end gap-4 -mx-8 -mb-8 mt-12">
                   <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-8 py-3 text-micro tracking-widest uppercase text-stone-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gold text-white px-10 py-3 text-micro tracking-[0.2em] font-bold uppercase hover:bg-gold-dark transition-all flex items-center gap-2"
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

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {isImportOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 sm:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsImportOpen(false)} className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-ivory w-full max-w-2xl max-h-[80vh] overflow-hidden relative shadow-2xl border border-stone-200 flex flex-col" role="dialog" aria-modal="true">
              <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                <h3 className="font-heading text-xl text-stone-800 tracking-wide uppercase">Bulk Import Products</h3>
                <button onClick={() => setIsImportOpen(false)} aria-label="Close" className="text-stone-400 hover:text-stone-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-8 space-y-8">
                <div className="space-y-6">
                  <h4 className="text-micro font-black text-stone-600 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Asset URLs</h4>
                  <textarea
                    value={importInput}
                    onChange={e => setImportInput(e.target.value)}
                    placeholder="Paste one /assets/... URL per line (or full https://... URLs)"
                    className="w-full bg-stone-50 border border-stone-100 p-4 text-micro tracking-widest outline-none focus:border-gold transition-colors resize-none h-48"
                  />
                </div>
                <div className="space-y-6">
                  <h4 className="text-micro font-black text-stone-600 uppercase tracking-[0.3em] border-b border-stone-100 pb-2">Or Upload Files</h4>
                  <div className="flex flex-wrap gap-3">
                    {importFiles.map((file, i) => (
                      <div key={i} className="relative group w-20 h-24 bg-stone-100 border border-stone-200 overflow-hidden">
                        <img src={URL.createObjectURL(file)} alt={`Import ${i + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setImportFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove file">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <div className="w-20 h-24 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-600 gap-1 cursor-pointer hover:border-gold/50 transition-colors relative" onClick={() => document.getElementById('bulk-import-upload')?.click()}>
                      <Plus className="w-4 h-4" />
                      <span className="text-micro tracking-widest uppercase">Upload</span>
                    </div>
                  </div>
                  <input
                    id="bulk-import-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => {
                      const files = Array.from(e.target.files || []);
                      setImportFiles(prev => [...prev, ...files]);
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>
              <div className="p-8 bg-onyx border-t border-stone-100 flex justify-end gap-4 -mx-8 -mb-8 mt-12">
                <button type="button" onClick={() => setIsImportOpen(false)} className="px-8 py-3 text-micro tracking-widest uppercase text-stone-400 hover:text-white transition-colors">Cancel</button>
                <button type="button" onClick={handleBulkImport} disabled={isImporting} className="bg-gold text-white px-10 py-3 text-micro tracking-[0.2em] font-bold uppercase hover:bg-gold-dark transition-all flex items-center gap-2">
                  {isImporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />} Import {importInput.split('\n').filter(Boolean).length + importFiles.length} Products
                </button>
              </div>
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
      <label className="text-micro uppercase tracking-widest text-stone-600 font-bold">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full bg-stone-50 border border-stone-100 p-4 text-micro tracking-widest outline-none focus:border-gold transition-colors"
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
      <span className="text-micro uppercase tracking-widest text-stone-600 font-bold">{label}</span>
    </label>
  );
}
