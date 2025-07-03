import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  ShoppingBag, 
  LogIn
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';
import TransactionPinModal from '../../components/ui/TransactionPinModal';
import SetPinModal from '../../components/ui/SetPinModal';

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

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateWalletBalance } = useAuthStore();
  const { addItem, getTotalItems } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'pay_on_delivery'>('wallet');
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    address: '',
    city: '',
    state: '',
    phone: user?.phone || '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/store');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    addItem(product, quantity);
    // Show success message
    alert('Product added to cart!');
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check if user has PIN set and is using wallet payment
    if (user && !user.hasPin) {
      setShowSetPinModal(true);
      return;
    }
    
    setShowCheckoutModal(true);
  };

  const handleCheckout = async () => {
    if (!product || !user) return;

    // Check if user has PIN set and is using wallet payment
    if (user.hasPin && paymentMethod === 'wallet') {
      setShowPinModal(true);
      return;
    }

    // If no PIN is set or using pay on delivery, proceed with checkout
    await processCheckout();
  };

  const processCheckout = async () => {
    if (!product || !user) return;

    setIsProcessing(true);
    try {
      const totalAmount = product.price * quantity;

      // Check wallet balance if paying with wallet
      if (paymentMethod === 'wallet' && user.walletBalance < totalAmount) {
        alert('Insufficient wallet balance. Please fund your wallet or choose pay on delivery.');
        setIsProcessing(false);
        return;
      }

      // Create order
      const orderData = {
        user_id: user.id,
        products: [{
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image_url: product.image_url,
        }],
        total_amount: totalAmount,
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        status: paymentMethod === 'wallet' ? 'processing' : 'pending',
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create transaction record
      const transactionData = {
        user_id: user.id,
        type: 'product_purchase',
        amount: totalAmount,
        status: paymentMethod === 'wallet' ? 'success' : 'pending',
        reference: `ORD-${order.id.slice(0, 8)}`,
        details: {
          order_id: order.id,
          product_name: product.name,
          quantity: quantity,
          payment_method: paymentMethod,
        },
      };

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([transactionData]);

      if (transactionError) throw transactionError;

      // Deduct from wallet if paying with wallet
      if (paymentMethod === 'wallet') {
        const newBalance = user.walletBalance - totalAmount;
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('id', user.id);

        if (balanceError) throw balanceError;
        updateWalletBalance(newBalance);
      }

      setShowCheckoutModal(false);
      setShowPinModal(false);
      navigate('/store/orders');
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Error processing order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F9D58]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h2>
          <Button onClick={() => navigate('/store')}>Back to Store</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/store')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white ml-4">Details</h1>
        </div>
        
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

      <div className="p-4 space-y-4 pb-32">
        {/* Product Image */}
        <div className="bg-yellow-50 rounded-3xl p-6 relative">
          <button className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full border border-red-500 bg-white">
            <Heart size={16} className="text-red-500" />
          </button>
          
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-64 object-contain mx-auto"
          />
          
          {/* Color options */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white"></div>
            <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white"></div>
            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
          </div>
          
          {/* Pagination dots */}
          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-6 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          {/* Name and Availability */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Available {product.in_stock ? 'in Stock' : 'for Pre-order'}
            </p>
          </div>

          {/* Price */}
          <div>
            <p className="text-2xl font-bold text-[#0F9D58]">
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {product.description}
            </p>
          </div>

          {/* Size Selection */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Size
            </p>
            <div className="flex space-x-3">
              {['XL', 'L', 'M', 'S'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border ${
                    selectedSize === size 
                      ? 'bg-gray-900 text-white border-gray-900' 
                      : 'bg-white text-gray-900 border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Authentication Notice */}
          {!isAuthenticated && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center">
                <LogIn className="text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" size={20} />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please <a href="/login" className="font-medium underline">login</a> to add items to cart or make purchases
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Add to Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleAddToCart}
          disabled={!isAuthenticated || !product.in_stock}
          className="w-full py-3 bg-red-500 text-white rounded-full font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to Cart
        </button>
      </div>

      {/* Transaction PIN Modal */}
      <TransactionPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={processCheckout}
      />

      {/* Set PIN Modal */}
      <SetPinModal
        isOpen={showSetPinModal}
        onClose={() => setShowSetPinModal(false)}
        onSuccess={() => setShowCheckoutModal(true)}
      />

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Checkout</h2>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="truncate pr-2">{product.name} x {quantity}</span>
                    <span className="font-medium">{formatCurrency(product.price * quantity)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total:</span>
                      <span className="text-[#0F9D58]">{formatCurrency(product.price * quantity)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet"
                      checked={paymentMethod === 'wallet'}
                      onChange={() => setPaymentMethod('wallet')}
                      className="mr-3 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Wallet</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        Balance: {formatCurrency(user?.walletBalance || 0)}
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="pay_on_delivery"
                      checked={paymentMethod === 'pay_on_delivery'}
                      onChange={() => setPaymentMethod('pay_on_delivery')}
                      className="mr-3 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">Pay on Delivery</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Pay when you receive your order</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Shipping Address</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCheckout}
                  isLoading={isProcessing}
                  className="flex-1 text-sm"
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;