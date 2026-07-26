import { Product, Testimonial } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: "L'Aube Majestic Gown",
    description: 'A signature Riman masterpiece. Featuring 24k gold-thread embroidery, hand-applied micro-pearls, and a dramatic four-meter cathedral train. This gown embodies Sharjah’s refined royal elegance and timeless allure.',
    productType: 'both',
    salePrice: 45000,
    rentalPrice: 8500,
    securityDeposit: 10000,
    images: [
      '/assets/rimanfashion_3542687554351211237_227867687_1_2025-01-10.jpg',
      '/assets/rimanfashion_3542687554351211237_227867687_2_2025-01-10.jpg'
    ],
    videoUrl: '/assets/rimanfashion_3801256646816264278_6730733643_2026-01-02.mp4',
    category: 'Bridal Gown',
    style: ['Cathedral', 'Embroidery', 'Royal'],
    color: ['Ivory', 'Gold'],
    fabric: 'French Chantilly Lace, Silk Organdy with Gold Thread',
    designer: 'Riman Atelier',
    sizes: ['XS', 'S', 'M', 'L'],
    isFeatured: true,
    isNew: true,
    glbUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    collectionYear: 2025,
    silhouette: 'Ballgown'
  },
  {
    id: '13',
    name: 'Majestic Bridal Set',
    description: 'A complete bridal ensemble featuring a hand-embroidered veil and a sculpted silk bodice. Designed for the bride who seeks a grand entrance with a contemporary Sharjah flair.',
    productType: 'both',
    salePrice: 38000,
    rentalPrice: 6000,
    securityDeposit: 7000,
    images: [
      '/assets/rimanfashion_3668321659658199107_227867687_3_2025-07-03.jpg'
    ],
    videoUrl: '/assets/rimanfashion_3674433706879885513_48077922453_2025-07-11.mp4',
    category: 'Bridal Gown',
    style: ['Modern', 'Grand'],
    color: ['Ivory'],
    fabric: 'Silk Mikado & Hand-beaded Tulle',
    designer: 'Riman Atelier',
    sizes: ['S', 'M', 'L'],
    isFeatured: true,
    collectionYear: 2025,
    silhouette: 'A-Line'
  },
  {
    id: '14',
    name: 'Emerald Night Gala',
    description: 'Deep emerald velvet meets shimmering silver embroidery in this show-stopping evening gown. Perfect for high-profile events and galas in the heart of the city.',
    productType: 'both',
    salePrice: 28000,
    rentalPrice: 4500,
    securityDeposit: 6000,
    images: [
      '/assets/rimanfashion_3694819982011488304_227867687_1_2025-08-08.jpg'
    ],
    videoUrl: '/assets/rimanfashion_3775737612968594326_227867687_2025-11-28.mp4',
    category: 'Evening Dress',
    style: ['Elegant', 'Velvet'],
    color: ['Emerald'],
    fabric: 'Italian Velvet',
    designer: 'Riman Atelier',
    sizes: ['S', 'M', 'L'],
    isNew: true,
    collectionYear: 2025,
    silhouette: 'A-Line'
  },
  {
    id: '15',
    name: 'Regal Rose Tiara',
    description: 'A delicate yet commanding headpiece featuring rose-gold plating and intricate floral motifs encrusted with micro-diamonds.',
    productType: 'both',
    salePrice: 12500,
    rentalPrice: 2200,
    securityDeposit: 3000,
    images: [
      '/assets/rimanfashion_3794117828967352274_6730733643_10_2025-12-23.jpg'
    ],
    category: 'Accessory',
    style: ['Floral', 'Royal'],
    color: ['Rose Gold'],
    fabric: 'Rose Gold Plated Silver',
    designer: 'Riman Atelier',
    sizes: ['One Size'],
    isNew: true,
    collectionYear: 2025,
    silhouette: 'One Size'
  },
  {
    id: '16',
    name: 'Heritage Gold Anklet',
    description: 'Traditional Emirati craftsmanship reimagined. This solid gold anklet features geometric patterns symbolic of Sharjah’s heritage.',
    productType: 'both',
    salePrice: 8500,
    rentalPrice: 1500,
    securityDeposit: 2000,
    images: [
      '/assets/rimanfashion_3794117828967352274_6730733643_15_2025-12-23.jpg'
    ],
    category: 'Fine Jewelry',
    style: ['Traditional', 'Minimalist'],
    color: ['Gold'],
    fabric: '22k Gold',
    designer: 'Riman Fine Jewelry',
    sizes: ['Small', 'Medium', 'Large'],
    isFeatured: true,
    collectionYear: 2025,
    silhouette: 'One Size'
  },
  {
    id: '9',
    name: 'Eternal Gilded Necklace',
    description: 'A breathtaking 18k solid gold necklace featuring ethically sourced VVS diamonds and a deep amber centerpiece. This artisanal piece is designed to shimmer under the soft lights of a grand celebration.',
    productType: 'both',
    salePrice: 125000,
    rentalPrice: 18000,
    securityDeposit: 25000,
    images: [
      '/assets/rimanfashion_3717964372695289282_4048704816_1_2025-09-09.jpg',
      '/assets/rimanfashion_3717964372695289282_4048704816_2_2025-09-09.jpg'
    ],
    videoUrl: '/assets/rimanfashion_3718635690872397774_53526772268_2025-09-10.mp4',
    category: 'Fine Jewelry',
    style: ['Regal', 'Bespoke'],
    color: ['Gold', 'Amber'],
    fabric: '18k Gold, Diamonds',
    designer: 'Riman Fine Jewelry',
    sizes: ['One Size'],
    isFeatured: true,
    isNew: true,
    collectionYear: 2025,
    silhouette: 'One Size'
  },
  {
    id: '10',
    name: 'Royal Heritage Tiara',
    description: 'Capture the essence of royalty with this gold-plated silver tiara. Encrusted with baroque pearls and rose-cut diamonds, it is a statement of grace for the discerning bride.',
    productType: 'both',
    salePrice: 18000,
    rentalPrice: 3500,
    securityDeposit: 5000,
    images: [
      '/assets/rimanfashion_3475218855592081083_227867687_1_2024-10-09.jpg',
      '/assets/rimanfashion_3475218855592081083_227867687_2_2024-10-09.jpg'
    ],
    category: 'Accessory',
    style: ['Royal', 'Traditional'],
    color: ['Gold', 'Pearl'],
    fabric: 'GP Silver, Pearls',
    designer: 'Riman Atelier',
    sizes: ['One Size'],
    isFeatured: true,
    collectionYear: 2024,
    silhouette: 'One Size'
  },
  {
    id: '11',
    name: 'Sharjah Star Bracelet',
    description: 'An intricate fusion of white and yellow gold, the Sharjah Star Bracelet features a geometric motif that pays homage to the rich cultural tapestry of the Emirates.',
    productType: 'both',
    salePrice: 15000,
    rentalPrice: 2800,
    securityDeposit: 3500,
    images: [
      '/assets/rimanfashion_3484604921436590913_227867687_1_2024-10-22.jpg',
      '/assets/rimanfashion_3484604921436590913_227867687_2_2024-10-22.jpg'
    ],
    category: 'Fine Jewelry',
    style: ['Geometric', 'Local Heritage'],
    color: ['Dual Tone'],
    fabric: 'Gold, White Gold',
    designer: 'Riman Fine Jewelry',
    sizes: ['Small', 'Medium'],
    collectionYear: 2024,
    silhouette: 'One Size'
  },
  {
    id: '12',
    name: 'Golden Bloom Earrings',
    description: 'Petal-shaped earrings with hand-set citrine centers and a halo of micro-diamonds.',
    productType: 'both',
    salePrice: 9500,
    rentalPrice: 1700,
    securityDeposit: 2000,
    images: [
      '/assets/rimanfashion_3359996951554297024_227867687_2024-05-03.mp4' // Using thumbnail logic
    ],
    category: 'Fine Jewelry',
    style: ['Organic', 'Elegant'],
    color: ['Gold'],
    fabric: '14k Gold, Citrine',
    designer: 'Riman Fine Jewelry',
    sizes: ['One Size'],
    collectionYear: 2024,
    silhouette: 'One Size'
  },
  {
    id: '2',
    name: 'Noor Royal Kaftan',
    description: 'Crafted from the finest Italian silk velvet, the Noor Royal Kaftan features meticulous Zardozi embroidery and crystal accents, offering a sophisticated silhouette for high-profile evening events.',
    productType: 'both',
    salePrice: 15500,
    rentalPrice: 3200,
    securityDeposit: 5000,
    images: [
      '/assets/rimanfashion_3638158883472325906_1739454936_1_2025-05-22.jpg',
      '/assets/rimanfashion_3638158883472325906_1739454936_2_2025-05-22.jpg'
    ],
    category: 'Evening Dress',
    style: ['Modern Arab'],
    color: ['Emerald', 'Gold'],
    fabric: 'Italian Silk Velvet',
    designer: 'Riman Atelier',
    sizes: ['S', 'M', 'L', 'XL'],
    isFeatured: true,
    glbUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/IridescentDishWithLight/glTF-Binary/IridescentDishWithLight.glb',
    collectionYear: 2025,
    silhouette: 'A-Line'
  },
  {
    id: '3',
    name: 'Ethereal Sands Gala',
    description: 'Inspired by the rhythmic beauty of Sharjah’s dunes, this gown features delicate 3D floral appliqués and a shimmering base that captures the magic of the golden hour.',
    productType: 'both',
    salePrice: 26000,
    rentalPrice: 4200,
    securityDeposit: 5000,
    images: [
      '/assets/rimanfashion_3679604103535485555_6730733643_1_2025-07-18.jpg',
      '/assets/rimanfashion_3679604103535485555_6730733643_2_2025-07-18.jpg'
    ],
    category: 'Evening Dress',
    style: ['Whimsical', 'Red Carpet'],
    color: ['Champagne'],
    fabric: 'Tulle with 3D Florals',
    designer: 'Riman Atelier',
    sizes: ['XS', 'S', 'M'],
    isFeatured: true,
    collectionYear: 2025,
    silhouette: 'A-Line'
  },
  {
    id: '4',
    name: 'Crystalline Muse',
    description: 'A masterpiece of luminosity, this column dress is encrusted with thousands of crystals. Its sleek design and high neckline offer a vision of modern architectural elegance.',
    productType: 'both',
    salePrice: 42000,
    rentalPrice: 6500,
    securityDeposit: 8000,
    images: [
      '/assets/rimanfashion_3677429744649852058_227867687_1_2025-07-15.jpg'
    ],
    category: 'Evening Dress',
    style: ['Bold', 'Elite'],
    color: ['Silver'],
    fabric: 'Hand-beaded Mesh',
    designer: 'Riman Atelier',
    sizes: ['S', 'M', 'L'],
    isNew: true,
    collectionYear: 2025,
    silhouette: 'Column'
  },
  {
    id: '5',
    name: 'Reverie Bridal Gown',
    description: 'For the bride who appreciates structural perfection. Sculpted from premium Mikado silk, the Reverie gown balances a minimalist aesthetic with a commanding presence.',
    productType: 'both',
    salePrice: 22000,
    rentalPrice: 3800,
    securityDeposit: 4500,
    images: [
      '/assets/rimanfashion_3668321659658199107_227867687_1_2025-07-03.jpg'
    ],
    category: 'Bridal Gown',
    style: ['Minimalist', 'Luxe'],
    color: ['Soft White'],
    fabric: 'Premium Mikado Silk',
    designer: 'Riman Atelier',
    sizes: ['S', 'M', 'L'],
    collectionYear: 2025,
    silhouette: 'A-Line'
  },
  {
    id: '6',
    name: 'Celestial Veil',
    description: 'Complete your bridal vision with the Celestial Veil. Hand-stitched crystals create a shimmering aura, flowing into a dramatic four-meter cathedral length.',
    productType: 'both',
    salePrice: 8500,
    rentalPrice: 1500,
    securityDeposit: 2000,
    images: [
      '/assets/rimanfashion_3542687554351211237_227867687_3_2025-01-10.jpg'
    ],
    category: 'Accessory',
    style: ['Modern', 'Luxury'],
    color: ['White'],
    fabric: 'Crystal-beaded Tulle',
    designer: 'Riman Atelier',
    sizes: ['One Size'],
    isFeatured: true,
    collectionYear: 2025,
    silhouette: 'One Size'
  },
  {
    id: '7',
    name: 'Zahra Evening Gown',
    description: 'A romantic exploration of floral textures. Intricate embroidery cascades over blush tulle, creating a gown that feels like a desert blossom in full bloom.',
    productType: 'both',
    salePrice: 24500,
    rentalPrice: 3500,
    securityDeposit: 4000,
    images: [
      '/assets/rimanfashion_3668024712984663829_6730733643_1_2025-07-02.jpg'
    ],
    category: 'Evening Dress',
    style: ['Floral', 'Ethereal'],
    color: ['Blush'],
    fabric: 'Embroidered Tulle',
    designer: 'Riman Atelier',
    sizes: ['S', 'M', 'L'],
    isFeatured: true,
    collectionYear: 2025,
    silhouette: 'A-Line'
  },
  {
    id: '8',
    name: 'Midnight Onyx Kaftan',
    description: 'Traditional Sharjah motifs are reimagined in this luxurious black velvet kaftan, featuring silver bullion embroidery for a look of understated majesty.',
    productType: 'both',
    salePrice: 15500,
    rentalPrice: 2800,
    securityDeposit: 3500,
    images: [
      '/assets/rimanfashion_3794117828967352274_6730733643_1_2025-12-23.jpg'
    ],
    category: 'Evening Dress',
    style: ['Traditional', 'Elite'],
    color: ['Black'],
    fabric: 'Velvet',
    designer: 'Riman Atelier',
    sizes: ['M', 'L', 'XL'],
    isFeatured: true,
    collectionYear: 2024,
    silhouette: 'Kaftan'
  }
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    authorName: 'Sugar Pie',
    authorRole: 'Bridal Client',
    content: 'They got some nice dresses!! I had an issue with my dress that I got from the same place and they were so helpful that they managed to get it fixed when it was their off day.',
    rating: 5
  },
  {
    id: '2',
    authorName: 'Mohammed Zaoui',
    authorRole: 'Fashion Client',
    content: 'The fashion designer at Riman is a pioneer in the art of design, innovation, and creativity. A model of dedication and sincerity in serving customers and perfecting her work. Exceeding expectations in the quality of service.',
    rating: 5
  }
];
