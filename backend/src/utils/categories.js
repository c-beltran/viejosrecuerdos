// Predefined categories for the antique store
const CATEGORIES = [
  'Mobiliario',
  'Porcelana', 
  'Cristal',
  'Joyeria',
  'Arte',
  'Libros',
  'Textiles',
  'Decoracion',
  'Herramientas',
  'Musica',
  'Relojes',
  'Otros'
];

// Category descriptions for UI display
const CATEGORY_DESCRIPTIONS = {
  'Mobiliario': 'Muebles antiguos y vintage',
  'Porcelana': 'Vajillas y objetos de porcelana',
  'Cristal': 'Objetos de cristal y vidrio',
  'Joyeria': 'Joyas y accesorios antiguos',
  'Arte': 'Pinturas, esculturas y obras de arte',
  'Libros': 'Libros antiguos y coleccionables',
  'Textiles': 'Ropa, tapices y telas antiguas',
  'Decoracion': 'Objetos decorativos varios',
  'Herramientas': 'Herramientas y utensilios antiguos',
  'Musica': 'Instrumentos musicales y discos',
  'Relojes': 'Relojes antiguos y de coleccion',
  'Otros': 'Otros objetos diversos'
};

// Validation function
const isValidCategory = (category) => {
  return CATEGORIES.includes(category);
};

// Get all categories
const getAllCategories = () => {
  return CATEGORIES.map(category => ({
    name: category,
    description: CATEGORY_DESCRIPTIONS[category]
  }));
};

module.exports = {
  CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  isValidCategory,
  getAllCategories
}; 