const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

function isSupabaseConfigured() {
  return Boolean(supabase);
}

// Initial mock dataset for local fallback
const defaultProducts = [
  {
    id: 'mailer',
    title: 'Mailer Box',
    tag: 'Mailer box',
    size_category: 'small',
    dims: '150 × 100 × 50 mm',
    price: '₹9',
    min_order: 100,
    default_thickness: '3-Ply Standard',
    desc: 'Perfect for jewelry, cosmetics, and small D2C shipments. Made from lightweight yet durable 3-ply kraft corrugated board. Custom printing options are available for wholesale orders. Designed to assemble quickly and ship safely without tape.',
    specs: ['3-ply corrugated board, 300 GSM kraft paper', 'Matte rustic kraft or plain clean brown finish', 'Self-locking tuck flap, completely tape-free assembly', '100% biodegradable and recycled material'],
    images: [
      'https://images.pexels.com/photos/8015700/pexels-photo-8015700.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/8015783/pexels-photo-8015783.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/8015781/pexels-photo-8015781.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  },
  {
    id: 'gift',
    title: 'Gift & Jewelry Box',
    tag: 'Gift box',
    size_category: 'small',
    dims: '120 × 120 × 60 mm',
    price: '₹22',
    min_order: 50,
    default_thickness: '3-Ply Standard',
    desc: 'Premium rigid setup gift box. Widely used for luxury wedding favors, festive gift hampers, jewelry packaging, and premium product giveaways. Features a stiff, heavy-duty cardboard core for ultimate crush-resistance.',
    specs: ['Rigid cardboard chipboard core, 1200 GSM thickness', 'Magnetic flap closure options', 'Custom lamination and debossing available on wholesale', 'Velvet-lined foam and die-cut dividers on request'],
    images: [
      'https://images.pexels.com/photos/6119143/pexels-photo-6119143.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/264771/pexels-photo-264771.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/264917/pexels-photo-264917.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  },
  {
    id: 'shipping',
    title: 'Shipping Carton',
    tag: 'Shipping carton',
    size_category: 'medium',
    dims: '300 × 220 × 180 mm',
    price: '₹28',
    min_order: 50,
    default_thickness: '5-Ply Heavy',
    desc: 'Our bestselling medium-sized shipper boxes. Specifically designed to withstand typical courier handling, transit vibrations, and drop impacts. Ideal for shipping apparel stacks, footwear, electronics, and books.',
    specs: ['5-ply double-wall corrugated structure', 'Heavy test kraft liners with vertical wave-fluting', 'Accepts heavy-weight taping securely', 'Fits securely inside standard plastic courier bags'],
    images: [
      'https://images.pexels.com/photos/7464209/pexels-photo-7464209.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7464972/pexels-photo-7464972.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4498136/pexels-photo-4498136.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  },
  {
    id: 'apparel',
    title: 'Apparel Folding Box',
    tag: 'Apparel box',
    size_category: 'medium',
    dims: '330 × 250 × 80 mm',
    price: '₹18',
    min_order: 100,
    default_thickness: '3-Ply Standard',
    desc: 'Pop-up folding apparel box designed specifically for clothing items like sarees, shirts, linens, and garments. Ships folded completely flat to save on warehousing footprint and snaps open in a few seconds.',
    specs: ['3-ply lightweight folding design, space-saving', 'Bleached white liner or plain classic kraft option', 'Convenient tuck-in lid closure, no tape needed', 'Provides a clean canvas for screen printing designs'],
    images: [
      'https://images.pexels.com/photos/7410461/pexels-photo-7410461.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7410459/pexels-photo-7410459.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7410458/pexels-photo-7410458.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  },
  {
    id: 'heavyduty',
    title: 'Heavy-Duty Box',
    tag: 'Heavy duty',
    size_category: 'large',
    dims: '450 × 350 × 300 mm',
    price: '₹54',
    min_order: 25,
    default_thickness: '7-Ply Heavy Duty',
    desc: 'Sturdy 7-ply heavy industrial packaging box. Engineered for shipping machine components, tools, metallic hardware parts, bulk supplies, and household electronics safely without structural bowing.',
    specs: ['7-ply triple fluting double-wall heavy board', 'Stitch-welded or reinforced corner seams', 'Safely handles load weights up to 25 kg', 'Moisture-resistant kraft outer lining'],
    images: [
      'https://images.pexels.com/photos/10834810/pexels-photo-10834810.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/10834813/pexels-photo-10834813.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  },
  {
    id: 'bulk',
    title: 'Bulk & Pallet Box',
    tag: 'Bulk pallet',
    size_category: 'large',
    dims: '600 × 400 × 400 mm',
    price: '₹89',
    min_order: 20,
    default_thickness: '7-Ply Heavy Duty',
    desc: 'Extra large bulk shipping box designed to align perfectly with standard truck loads and wooden pallets. Highly suitable for commercial supply chains, cargo moves, exports, and heavy agricultural shipments.',
    specs: ['Pallet-stackable volume proportions', 'Super thick double-wall board structure', 'Double layer stitched base options', 'Specifically reinforced bottom corners to prevent stack slips'],
    images: [
      'https://images.pexels.com/photos/29653988/pexels-photo-29653988.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/29653989/pexels-photo-29653989.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/172074/pexels-photo-172074.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  }
];

const dbFilePath = path.join(__dirname, 'local_db.json');

function getLocalData() {
  if (!fs.existsSync(dbFilePath)) {
    const initial = { products: defaultProducts, orders: [] };
    fs.writeFileSync(dbFilePath, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { products: defaultProducts, orders: [] };
  }
}

function saveLocalData(data) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
}

module.exports = {
  supabase,
  isSupabaseConfigured,
  getLocalData,
  saveLocalData,
};
