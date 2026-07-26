type StyleResult = {
  aesthetic: string;
  description: string;
  advice: string;
  recommendedVibe: string;
};

const resultMap: Record<string, StyleResult> = {
  'Grand Ballroom': {
    aesthetic: 'Majestic Opulence',
    description: 'Your vision calls for grandeur — sweeping silhouettes, cathedral trains, and gold-threaded embroidery. A ballroom setting demands showstopping elegance that commands every room.',
    advice: 'Opt for structured fabrics like Mikado silk or Peau de Soie. They hold architectural shapes that mirror the grandeur of a ballroom setting.',
    recommendedVibe: 'Classical'
  },
  'Desert Oasis': {
    aesthetic: 'Ethereal Desert Rose',
    description: 'Under the stars, your look should flow like desert sand. Light, layered fabrics and delicate embroidery catch the moonlight and create a silhouette that feels both bohemian and royal.',
    advice: 'Choose flowing tulle or chiffon with subtle embellishments. The desert calls for movement — let your gown catch the evening breeze.',
    recommendedVibe: 'Bohemian'
  },
  'Private Coastal': {
    aesthetic: 'Seaside Serenity',
    description: 'An intimate coastal setting calls for effortless sophistication. Clean lines, soft textures, and an understated luxury that lets the natural beauty of the sea frame your moment.',
    advice: 'Consider lighter fabrics with subtle shimmer. A sleek silhouette with an ocean-inspired palette creates timeless coastal elegance.',
    recommendedVibe: 'Modern'
  },
  'Modern Skyline': {
    aesthetic: 'Urban Avant-Garde',
    description: 'Against a city skyline, your look should be architectural and bold. Clean planes, unexpected details, and a contemporary silhouette that mirrors the modern world around you.',
    advice: 'Embrace structured minimalism. Sharp lines and luxurious simplicity make a powerful statement against an urban backdrop.',
    recommendedVibe: 'Avant-Garde'
  },
  'Majestic Ballgown': {
    aesthetic: 'Royal Cathedral',
    description: 'The ballgown silhouette speaks of timeless grandeur. A fitted bodice cascading into a dramatic skirt creates a presence that fills any space with regal beauty.',
    advice: 'Ensure your venue can accommodate the volume. A grand silhouette deserves a grand stage — cathedral ceilings and sweeping aisles are your ally.',
    recommendedVibe: 'Classical'
  },
  'Sophisticated Mermaid': {
    aesthetic: 'Sculpted Elegance',
    description: 'The mermaid silhouette is the epitome of confident sophistication. It traces your curves before flaring into a dramatic hem — a shape that commands attention with refined sensuality.',
    advice: 'Consider the level of comfort you need for dancing. A mermaid silhouette can be structured — plan for movement at your reception.',
    recommendedVibe: 'Modern'
  },
  'Ethereal A-Line': {
    aesthetic: 'Timeless Romance',
    description: 'The A-line silhouette is universally flattering and endlessly romantic. It flows gracefully from waist to hem, creating a silhouette that feels like stepping from a fairy tale.',
    advice: 'This versatile silhouette pairs beautifully with any venue. Focus on fabric choice to set the tone — delicate lace for romance, structured silk for sophistication.',
    recommendedVibe: 'Classical'
  },
  'Modern Slip Dress': {
    aesthetic: 'Effortless Luxe',
    description: 'The slip dress silhouette redefines bridal elegance. Minimal, fluid, and achingly modern — it says everything by saying almost nothing at all.',
    advice: 'Invest in the finest fabric you can find. With minimal silhouette, every thread is visible. Bias-cut silk or satin will move like liquid light.',
    recommendedVibe: 'Avant-Garde'
  },
  'Intricate Hand-Stitched Lace': {
    aesthetic: 'Heritage Artistry',
    description: 'Hand-stitched lace carries centuries of craftsmanship in every thread. This choice speaks to a bride who values tradition, artistry, and the human touch behind every motif.',
    advice: 'Let the lace be your statement. Pair with simple accessories to let the intricate handwork remain the focal point of your look.',
    recommendedVibe: 'Classical'
  },
  'Architectural Silk Mikado': {
    aesthetic: 'Structural Majesty',
    description: 'Mikado silk creates bold, architectural shapes that hold their form with quiet authority. This is fabric that sculpts rather than simply drapes.',
    advice: 'Embrace bold proportions. Mikado begs for dramatic volume — exaggerated bows, sculpted peplums, or a sweeping cathedral train.',
    recommendedVibe: 'Avant-Garde'
  },
  'Flowing Chiffon & Tulle': {
    aesthetic: 'Whispered Romance',
    description: 'Chiffon and tulle create movement that feels like poetry. Every step creates a cascade of soft layers, catching light and air in equal measure.',
    advice: 'Layer multiple shades of ivory for depth. A single layer of tulle can look flat — dimensional layering creates the ethereal effect you desire.',
    recommendedVibe: 'Bohemian'
  },
  'Luminous Satin & Pearls': {
    aesthetic: 'Gilded Luminescence',
    description: 'Satin moves like liquid metal, and pearls catch light like captured starlight. Together they create a look of unmistakable opulence and refined glamour.',
    advice: 'Balance is key. Let satin be your canvas and pearls your brushstrokes — a little goes a long way when the materials are this luminous.',
    recommendedVibe: 'Classical'
  },
  'Timeless Heritage': {
    aesthetic: 'Eternal Elegance',
    description: 'Your heart leans toward designs that transcend trends. Heritage-inspired pieces with traditional embroidery and time-tested silhouettes create a look that will be as breathtaking in decades as it is today.',
    advice: 'Look for pieces with hand-embroidery and traditional techniques like Tali. These details create an heirloom that carries your family\'s story forward.',
    recommendedVibe: 'Classical'
  },
  'Bold Avant-Garde': {
    aesthetic: 'Visionary Edge',
    description: 'You are drawn to pieces that challenge convention. Unexpected cuts, architectural details, and bold proportions create a look that is not just worn — it is experienced.',
    advice: 'Trust the process. Avant-garde pieces can feel intimidating on the hanger but transform completely on the body. Be open to silhouettes you hadn\'t considered.',
    recommendedVibe: 'Avant-Garde'
  },
  'Soft Romanticism': {
    aesthetic: 'Dreaming in Silk',
    description: 'Your aesthetic is defined by softness — gentle gathers, delicate florals, and a color palette drawn from nature. This is romance without drama, elegance without excess.',
    advice: 'Focus on how the fabric moves. The right silk will create a gentle flutter as you walk, turning every step into a dance.',
    recommendedVibe: 'Bohemian'
  },
  'Understated Minimalism': {
    aesthetic: 'Quiet Power',
    description: 'Less is more, and you understand that better than anyone. Your eye is drawn to impeccable construction, perfect proportions, and the kind of luxury that speaks in whispers rather than shouts.',
    advice: 'Invest in a single extraordinary detail — perhaps an unexpected back, a perfect pleat, or fabric that shifts color in different light. Minimalist gowns reward close inspection.',
    recommendedVibe: 'Modern'
  }
};

export function getStylingAdvice(responses: Record<string, string>): StyleResult {
  const venue = responses['Where do you envision your celebration?'] || '';
  const silhouette = responses['Which silhouette speaks to your soul?'] || '';
  const fabric = responses['Which texture feels most like you?'] || '';
  const mood = responses["What is the defining 'aura' of your day?"] || '';

  const key = fabric || silhouette || venue || mood;
  const result = resultMap[key];

  if (result) return result;

  const keys = Object.values(responses);
  for (const k of keys) {
    if (resultMap[k]) return resultMap[k];
  }

  return {
    aesthetic: 'Refined Elegance',
    description: 'Your unique combination of preferences points to a style that is both timeless and personal — refined elegance that transcends passing trends.',
    advice: 'Focus on fit and fabric quality above all. When in doubt, choose the option that feels most authentically you.',
    recommendedVibe: 'Classical'
  };
}