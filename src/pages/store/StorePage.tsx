import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Grid2X2 } from 'lucide-react';
import ProductCard from '../../components/store/ProductCard';
import Card from '../../components/ui/Card';
import { useCartStore } from '../../store/cartStore';
import { useProductStore } from '../../store/productStore';

const StorePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const { getTotalItems } = useCartStore();
  const { products, loading, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'featured':
        default:
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      }
    });

  const featuredProducts = products.filter(p => p.is_featured || p.is_new).slice(0, 6);

  const categories = [
    { value: 'all', label: 'All Products', count: products.length },
    ...Array.from(new Set(products.map(p => p.category))).map(category => ({
      value: category,
      label: category,
      count: products.filter(p => p.category === category).length
    }))
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
  ];

  // Background colors for product cards
  const bgColors = [
    'bg-purple-50',
    'bg-yellow-50',
    'bg-green-50',
    'bg-blue-50',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700 w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Online Shop</h1>
          
          <div className="flex items-center space-x-3">
            <button className="p-2">
              <Search size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
            <button 
              onClick={() => navigate('/store/cart')}
              className="relative p-2"
            >
              <ShoppingBag size={20} className="text-gray-700 dark:text-gray-300" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-medium text-gray-900 dark:text-white">Categories</h2>
            <button 
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-sm text-primary-500 font-medium"
            >
              {showAllCategories ? 'Show Less' : 'View All'}
            </button>
          </div>
          
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex space-x-3 min-w-max flex-nowrap">
              {(showAllCategories ? categories : categories.slice(0, 5)).map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.value
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-500'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Recommendation Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recommendation</h2>
            <button className="p-1">
              <Grid2X2 size={18} className="text-gray-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className={`rounded-2xl overflow-hidden ${bgColors[index % bgColors.length]}`}
                onClick={() => navigate(`/store/product/${product.id}`)}
              >
                <div className="p-3 relative">
                  <button className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full border border-red-500 bg-white">
                    <Heart size={14} className="text-red-500" />
                  </button>
                  
                  <div className="aspect-square rounded-xl overflow-hidden bg-white mb-2">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg';
                      }}
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-base font-bold text-primary-500">
                      ${product.price.toFixed(2)}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <button className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full">
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Products Section */}
        {filteredProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.value === selectedCategory)?.label}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredProducts.length} found
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className={`rounded-2xl overflow-hidden ${bgColors[index % bgColors.length]}`}
                  onClick={() => navigate(`/store/product/${product.id}`)}
                >
                  <div className="p-3 relative">
                    <button className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full border border-red-500 bg-white">
                      <Heart size={14} className="text-red-500" />
                    </button>
                    
                    <div className="aspect-square rounded-xl overflow-hidden bg-white mb-2">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg';
                        }}
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-base font-bold text-primary-500">
                        ${product.price.toFixed(2)}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <button className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full">
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <Card className="p-8 text-center w-full">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StorePage;