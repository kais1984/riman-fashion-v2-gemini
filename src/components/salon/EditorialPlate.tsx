import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { translateProductValue } from '../../lib/productVocab';
import { Product } from '../../types';

interface EditorialPlateProps {
  product: Product;
  index: number;
  reverse?: boolean;
}

export default function EditorialPlate({ product, index, reverse }: EditorialPlateProps) {
  const { t, language } = useLanguage();
  const lookNumber = String(index + 1).padStart(2, '0');

  return (
    <figure className="group grid gap-6 md:grid-cols-12 md:gap-10 items-end">
      <div className={cn('relative overflow-hidden md:col-span-7', reverse && 'md:order-2')}>
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute top-4 left-4 font-heading text-6xl font-light text-white/90 drop-shadow-md">
          {lookNumber}
        </span>
      </div>
      <figcaption className={cn('flex flex-col gap-3 md:col-span-5', reverse && 'md:order-1')}>
        <span className="font-label text-xs tracking-[0.3em] uppercase text-gold">
          {t('silhouettes.look')} {lookNumber}
        </span>
        <h3 className="font-heading text-2xl md:text-3xl font-light text-stone-800">{product.name}</h3>
        {product.fabric && (
          <p className="font-editorial italic text-stone-600">{translateProductValue('fabric', product.fabric, language)}</p>
        )}
        <Link
          to={`/product/${product.id}`}
          className="group/link inline-flex items-center gap-2 font-label text-xs tracking-[0.25em] uppercase text-stone-800 transition-colors duration-700 hover:text-gold mt-2"
        >
          {t('silhouettes.enquire')}
          <ArrowRight className="w-4 h-4 transition-transform duration-700 group-hover/link:translate-x-1 rtl:rotate-180" />
        </Link>
      </figcaption>
    </figure>
  );
}
