import React, { useContext } from "react";
import { useBestSpecs } from "./hooks/useBestSpecs";
import { getAllSpecKeys, type Product } from "./product";
import { LocationContext } from "./LocationContext";
import { RecommendationContext } from "./RecommendationQuery/RecommendationContext";
import SpecData from "./ui/SpecData";

/**
 * Props for the MultiColumnComparison component
 */
type PredefinedComparisonProps = {
  className?: string;
  children?: React.ReactNode;
  products: Product[];
  currentProduct: Product | undefined;
};

/**
 * A component that renders a multi-column product comparison interface.
 * Features a multi-select dropdown for product selection and displays a detailed
 * comparison table of the selected products' specifications.
 *
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes to apply to the component
 * @param {React.ReactNode} [props.children] - Child elements
 * @param {Product[]} props.products - Array of products available for comparison
 * @returns {JSX.Element} The rendered multi-column comparison component
 */
const PredefinedComparison = ({
  className,
  products,
  currentProduct,
}: PredefinedComparisonProps) => {
  const collectionIncludesCurrentProduct =
    currentProduct?.id && products.some(({ id }) => currentProduct?.id === id);
  const productsWithCurrentProduct = !currentProduct
    ? products
    : (currentProduct && collectionIncludesCurrentProduct
        ? []
        : [currentProduct]
      ).concat(products);

  const selectedOptions = productsWithCurrentProduct.map((product) => ({
    value: String(product.id),
    label: product.title,
    product: product,
    isFixed: window.location.pathname.includes(product.handle),
  }));
  const { location: userLocation } = useContext(LocationContext);

  const allSpecKeys = getAllSpecKeys(
    productsWithCurrentProduct,
    selectedOptions,
  );
  const { bestSpecs } = useBestSpecs(
    productsWithCurrentProduct,
    Array.from(selectedOptions),
  );
  useContext(RecommendationContext);

  if (selectedOptions.length === 0) {
    return (
      <div hidden={true}>
        <p>No products selected.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {Array.isArray(selectedOptions) &&
      selectedOptions?.length === 0 ? null : (
        <div className="overflow-x-auto">
          {selectedOptions.length > 0 && (
            <div className="comparison-table">
              <h3>Comparison</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Specification</th>
                    {selectedOptions.map((selectedProduct) => {
                      const product = selectedProduct.product;
                      return (
                        <th key={product.id} className="text-center!">
                          {product?.title}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {allSpecKeys.map((specKey) => (
                    <tr key={specKey}>
                      {specKey === "available_regions" && userLocation ? (
                        <td>{`Available in ${userLocation?.country_name || "N/A"}?`}</td>
                      ) : (
                        <td>{specKey.replace("_", " ")}</td>
                      )}
                      {selectedOptions.map((selectedProduct) => (
                        <SpecData
                          key={selectedProduct.product.id}
                          productId={String(selectedProduct.product.id)}
                          specValue={selectedProduct.product.specs?.[specKey]}
                          specKey={specKey}
                          userLocation={userLocation}
                          bestSpecs={bestSpecs}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PredefinedComparison;
