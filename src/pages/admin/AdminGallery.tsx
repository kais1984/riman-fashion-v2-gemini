import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Trash2, Edit2, GripVertical, Star, StarOff } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../services/supabase';
import type { GalleryItem } from '../../hooks/useGallery';

const CATEGORIES = [
  { value: 'bridal', label: 'Bridal' },
  { value: 'evening', label: 'Evening' },
  { value: 'behind_scenes', label: 'Behind the Scenes' },
  { value: 'client_stories', label: 'Client Stories' },
];

export default function AdminGallery() {
  const { t } = useLanguage();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: 'bridal', sort_order: 0, is_featured: false });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    if (!supabase) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('gallery_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setItems((data || []) as GalleryItem[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('video/')) {
        resolve('');
        return;
      }
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.onloadeddata = () => { video.currentTime = 1; };
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
        URL.revokeObjectURL(video.src);
      };
    });
  };

  const uploadBase64ToStorage = async (base64: string, path: string): Promise<string> => {
    const res = await fetch(base64);
    const blob = await res.blob();
    const { data } = await supabase!.storage.from('gallery').upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });
    return supabase!.storage.from('gallery').getPublicUrl(data!.path).data.publicUrl;
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `gallery/${Date.now()}.${ext}`;
      const { data: uploadData } = await supabase.storage.from('gallery').upload(path, file);

      if (uploadData) {
        const mediaUrl = supabase.storage.from('gallery').getPublicUrl(uploadData.path).data.publicUrl;
        const mediaType = file.type.startsWith('video/') ? 'video' : 'photo';
        let thumbnailUrl = '';

        if (mediaType === 'video') {
          const base64Thumb = await generateThumbnail(file);
          if (base64Thumb) {
            const thumbPath = `gallery/thumb_${Date.now()}.jpg`;
            thumbnailUrl = await uploadBase64ToStorage(base64Thumb, thumbPath);
          }
        }

        await supabase.from('gallery_items').insert({
          title: '',
          description: '',
          category: 'bridal',
          media_url: mediaUrl,
          media_type: mediaType,
          thumbnail_url: thumbnailUrl,
          sort_order: items.length,
          is_featured: false,
        });

        await fetchItems();
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      description: item.description,
      category: item.category,
      sort_order: item.sort_order,
      is_featured: item.is_featured,
    });
  };

  const handleSave = async () => {
    if (!editingId || !supabase) return;
    await supabase.from('gallery_items').update(editForm).eq('id', editingId);
    setEditingId(null);
    await fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    await supabase.from('gallery_items').delete().eq('id', id);
    setDeleteConfirm(null);
    await fetchItems();
  };

  const handleToggleFeatured = async (item: GalleryItem) => {
    if (!supabase) return;
    await supabase.from('gallery_items').update({ is_featured: !item.is_featured }).eq('id', item.id);
    await fetchItems();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl tracking-widest uppercase">{t('gallery.admin_title')}</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-onyx text-xs tracking-widest uppercase font-bold hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : t('gallery.admin_upload')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      <div className="bg-white border border-stone-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200 text-[10px] tracking-widest uppercase text-stone-500">
              <th className="text-left p-4 w-16"></th>
              <th className="text-left p-4">Media</th>
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Type</th>
              <th className="text-left p-4">Order</th>
              <th className="text-left p-4">Featured</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                <td className="p-4">
                  <GripVertical className="w-4 h-4 text-stone-300" />
                </td>
                <td className="p-4">
                  {item.media_type === 'video' ? (
                    <video src={item.thumbnail_url || item.media_url} className="w-16 h-16 object-cover" />
                  ) : (
                    <img src={item.media_url} alt={item.title || 'Gallery image'} className="w-16 h-16 object-cover" />
                  )}
                </td>
                <td className="p-4">
                  {editingId === item.id ? (
                    <input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="border border-stone-200 px-2 py-1 text-xs w-full"
                    />
                  ) : (
                    <span className="text-xs">{item.title || '(untitled)'}</span>
                  )}
                </td>
                <td className="p-4">
                  {editingId === item.id ? (
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="border border-stone-200 px-2 py-1 text-xs"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-stone-100 text-[10px] tracking-widest uppercase">
                      {item.category.replace('_', ' ')}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span className="text-[10px] tracking-widest uppercase">{item.media_type}</span>
                </td>
                <td className="p-4">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      value={editForm.sort_order}
                      onChange={(e) => setEditForm({ ...editForm, sort_order: parseInt(e.target.value) || 0 })}
                      className="border border-stone-200 px-2 py-1 text-xs w-16"
                    />
                  ) : (
                    <span className="text-xs">{item.sort_order}</span>
                  )}
                </td>
                <td className="p-4">
                  <button onClick={() => handleToggleFeatured(item)} className="text-gold hover:text-gold/70 transition-colors">
                    {item.is_featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {editingId === item.id ? (
                      <>
                        <button onClick={handleSave} className="text-xs text-gold hover:text-gold/70 font-bold">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-stone-400 hover:text-stone-600">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(item)} className="text-stone-400 hover:text-gold transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="text-stone-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-6"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white p-8 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg tracking-widest uppercase mb-4">Delete Item?</h3>
              <p className="text-stone-500 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-stone-200 text-xs tracking-widest uppercase hover:border-gold">
                  Cancel
                </button>
                <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-rose-500 text-white text-xs tracking-widest uppercase hover:bg-rose-600">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
