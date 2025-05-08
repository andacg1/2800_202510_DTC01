import { useState, useEffect } from 'react';
import './App.css';

interface Product {
  id: string;
  title: string;
  specs: Record<string, any>;
}

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This function would normally fetch from your Shopify store
  // In this basic implementation, we're mocking product data
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Mock data - in reality this would be an API call
        const mockProducts = [
          {
            id: 'prod1',
            title: 'Snowboard Alpha',
            specs: {
              length: '160 cm',
              width: '25 cm',
              material: 'Carbon Fiber',
              available_regions: ['North America', 'Europe']
            }
          },
          {
            id: 'prod2',
            title: 'Snowboard Beta',
            specs: {
              length: '155 cm',
              width: '24 cm',
              material: 'Fiberglass',
              available_regions: ['Europe', 'Asia']
            }
          },
          {
            id: 'prod3',
            title: 'Snowboard Gamma',
            specs: {
              length: '165 cm',
              width: '26 cm',
              material: 'Wood Core',
              available_regions: ['North America', 'Asia', 'Australia']
            }
          }
        ];
        
        setProducts(mockProducts);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        // Limit to comparing 2 products maximum
        if (prev.length < 2) {
          return [...prev, productId];
        }
        return [prev[1], productId]; // Replace oldest selection
      }
    });
  };

  // Get all unique spec keys across selected products
  const getAllSpecKeys = () => {
    const selectedProductData = products.filter(p => selectedProducts.includes(p.id));
    const allKeys = new Set<string>();
    
    selectedProductData.forEach(product => {
      Object.keys(product.specs).forEach(key => {
        allKeys.add(key);
      });
    });
    
    return Array.from(allKeys);
  };

  const trackComparison = async () => {
    // This would normally send data to your Shopify app backend
    if (selectedProducts.length === 2) {
      try {
        console.log(`Tracking comparison between ${selectedProducts[0]} and ${selectedProducts[1]}`);
        // In a real implementation, you would call your API endpoint
        // await fetch('/api.product.comparison.track', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     productAId: selectedProducts[0],
        //     productBId: selectedProducts[1],
        //     userId: 'anonymous',
        //     shop: window.location.hostname
        //   })
        // });
      } catch (err) {
        console.error('Failed to track comparison', err);
      }
    }
  };

  // Track comparison when two products are selected
  useEffect(() => {
    if (selectedProducts.length === 2) {
      trackComparison();
    }
  }, [selectedProducts]);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="product-comparison">
      <h2>Product Comparison</h2>
      
      <div className="product-selection">
        <h3>Select Products to Compare (max 2)</h3>
        <div className="products-grid">
          {products.map(product => (
            <div 
              key={product.id}
              className={`product-card ${selectedProducts.includes(product.id) ? 'selected' : ''}`}
              onClick={() => toggleProductSelection(product.id)}
            >
              <h4>{product.title}</h4>
              <div className="select-indicator">
                {selectedProducts.includes(product.id) ? '✓' : '+'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <div className="comparison-table">
          <h3>Comparison</h3>
          <table>
            <thead>
              <tr>
                <th>Specification</th>
                {selectedProducts.map(productId => {
                  const product = products.find(p => p.id === productId);
                  return <th key={productId}>{product?.title}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {getAllSpecKeys().map(specKey => (
                <tr key={specKey}>
                  <td>{specKey.replace('_', ' ')}</td>
                  {selectedProducts.map(productId => {
                    const product = products.find(p => p.id === productId);
                    const specValue = product?.specs[specKey];
                    return (
                      <td key={`${productId}-${specKey}`}>
                        {Array.isArray(specValue) 
                          ? specValue.join(', ') 
                          : specValue?.toString() || 'N/A'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
