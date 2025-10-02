import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Star, Package } from 'lucide-react';
import { productService } from '../../services/product.service';
import { cartService } from '../../services/cart.service';
import { useAuth } from '../../contexts/AuthContext';
import { useCartStore } from '../../stores/cart.store';
import { useDebounce } from '../../hooks/useDebounce';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast';
import type { Product, ProductCategory } from '../../types';

export function ProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const addToCartStore = useCartStore((state) => state.addItem);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadData();
  }, [selectedCategory, debouncedSearchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts({
          category: selectedCategory || undefined,
          search: debouncedSearchTerm || undefined,
          limit: 50,
        }),
        productService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error: any) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await cartService.addToCart(user.id, product.id, 1);
      addToCartStore({
        id: crypto.randomUUID(),
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product,
      });
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Auto Parts Store</h1>
          <p className="text-lg text-gray-600">Browse quality parts from verified vendors</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-semibold mb-4">Filters</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === ''
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={loadData}>
                Apply Filters
              </Button>
            </Card>
          </aside>

          <main className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loading size="lg" />
              </div>
            ) : products.length === 0 ? (
              <Card className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </Card>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-medium">{products.length}</span> products
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} hover className="flex flex-col">
                      <div
                        className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        {product.image_urls && product.image_urls.length > 0 ? (
                          <img
                            src={product.image_urls[0]}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-16 w-16 text-gray-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="mb-2">
                          {product.category && (
                            <Badge variant="info" className="mb-2">
                              {product.category.name}
                            </Badge>
                          )}
                          <h3
                            className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-600"
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            {product.name}
                          </h3>
                          {product.vendor && (
                            <p className="text-sm text-gray-600">
                              by {product.vendor.shop_name}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mb-3">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {product.rating.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({product.review_count})
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(product.price)}
                          </span>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(product.compare_at_price)}
                            </span>
                          )}
                        </div>

                        {product.stock_quantity > 0 ? (
                          <Badge variant="success" className="mb-4">
                            In Stock ({product.stock_quantity} available)
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="mb-4">
                            Out of Stock
                          </Badge>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock_quantity === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
