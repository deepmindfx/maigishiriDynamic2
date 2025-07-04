import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { useCartStore } from '../../store/cartStore';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  category: string;
  in_stock: boolean;
  rating: number;
  reviews: number;
  discount: number;
  is_new: boolean;
  is_featured: boolean;
  created_at: string;
};

type ProductCardProps = {
  product: Product;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
  };

  const handleProductClick = () => {
    navigate(`/store/product/${product.id}`);
  };

  // Background colors for product cards
  const bgColors = [
    'bg-shop-purple',
    'bg-shop-yellow',
    'bg-shop-green',
    'bg-shop-blue',
  ];
  
  // Randomly select a background color
  const bgColor = bgColors[Math.floor(Math.random() * bgColors.length)];

  return (
    <div 
      className={`rounded-2xl overflow-hidden ${bgColor} cursor-pointer`}
      onClick={handleProductClick}
    >
      <div className="p-3 relative">
        <button 
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full border border-red-500 bg-white"
        >
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
            ₦{product.price.toFixed(2)}
          </p>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(e);
              }}
              className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;