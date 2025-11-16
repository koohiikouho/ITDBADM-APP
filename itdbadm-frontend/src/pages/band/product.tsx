import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BandInfoHead from "@/components/bandPageComponents/bandInfoHead";
import DefaultLayout from "@/layouts/default";
import AnimatedContent from "@/components/AnimatedContent";
import ProductBody from "@/components/bandPageComponents/bandProduct";
import CompactProductGrid from "@/components/bandPageComponents/BandProductFooter";
import { BandData } from "./bandinfo";
import { apiClient } from "@/lib/api";

interface ProductData {
  band_id: number;
  name: string;
  price: string;
  description: string;
  category: string;
  image: {
    url: string;
  };
}

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [bandData, setBandData] = useState<BandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!productId) {
          throw new Error("No product ID found in URL");
        }

        console.log("Fetching product from:", `/products/${productId}`);

        // Fetch product data
        const productResponse = await fetch(
          apiClient.baseURL + `/products/${productId}`
        );

        if (!productResponse.ok) {
          throw new Error(`Failed to fetch product: ${productResponse.status}`);
        }

        const product: ProductData = await productResponse.json();
        console.log("Product API Response:", product);
        setProductData(product);

        // Fetch band data using the band_id from product
        console.log(
          "Fetching band from:",
          apiClient.baseURL + `/bands/${product.band_id}`
        );
        const bandResponse = await fetch(
          apiClient.baseURL + `/bands/${product.band_id}`
        );

        if (!bandResponse.ok) {
          throw new Error(`Failed to fetch band: ${bandResponse.status}`);
        }

        const band: BandData[] = await bandResponse.json();
        console.log("Band API Response:", band);

        if (band && band.length > 0) {
          setBandData(band[0]);
        } else {
          throw new Error("No band data found");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center py-16">
          <div className="text-lg">Loading product...</div>
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center py-16">
          <div className="text-lg text-red-500">Error: {error}</div>
        </div>
      </DefaultLayout>
    );
  }

  if (!productData || !bandData) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center py-16">
          <div className="text-lg">Product not found</div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <AnimatedContent
        distance={150}
        direction="vertical"
        reverse={false}
        duration={0.5}
        ease="power3.out"
        initialOpacity={0.2}
        animateOpacity
        scale={1}
        threshold={0.2}
        delay={0.1}
      >
        <div className="mx-30">
          <BandInfoHead
            isDescriptionOn
            bandData={bandData}
            bandId={productData.band_id}
          />
          <ProductBody productData={productData} bandData={bandData} />
          <div className="flex content-center flex-col items-center">
            <div className="font-bold mb-3">Other {bandData.name} Merch</div>
            <CompactProductGrid />
          </div>
        </div>
      </AnimatedContent>
      <br />
    </DefaultLayout>
  );
}
