import { Avatar, Divider, Link } from "@heroui/react";
import Carousel from "./ImageCarousel";
import ShareButton from "./ShareButton";
import ReportMenu from "./Report";
import AddToCartButton from "./AddToCart";
import BuyNowButton from "./BuyNow";
import HeartButton from "./HeartButton";
import { BandData } from "@/pages/band/bandinfo";

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

interface ProductBodyProps {
  productData: ProductData;
  bandData: BandData;
}

const ProductBody: React.FC<ProductBodyProps> = ({ productData, bandData }) => {
  // Use the product image as the main image, and create sample variations
  const productImages = [
    productData.image.url,
    productData.image.url, // In a real app, you'd have multiple images
    productData.image.url,
    productData.image.url,
  ];

  // Format price to JPY
  const formatPrice = (price: string) => {
    try {
      const numericPrice = parseFloat(price);
      return isNaN(numericPrice)
        ? price
        : `${numericPrice.toLocaleString("ja-JP")} JPY`;
    } catch {
      return price;
    }
  };

  return (
    <div className="grid grid-cols-[65%_35%] grid-rows-3 gap-4">
      <div className="row-span-2">
        <Carousel images={productImages} />
      </div>
      <div className="flex flex-col p-2">
        <div className="flex">
          <Avatar size="sm" className="mr-2" src={bandData.pfp_string} />
          <Link
            color="foreground"
            href={`/bandinfo/${bandData.branch_id}`}
            className="font-bold text-gray-400 dark:text-gray-100 text-xl"
          >
            {bandData.name}
          </Link>
        </div>
        <br />
        <div className="font-bold pt-3 text-3xl text-gray-500 dark:text-gray-50">
          {productData.name}
        </div>
        <div className="flex flex-row mt-5 justify-between">
          <div>
            <HeartButton />
          </div>

          <div className="flex flex-row-reverse ">
            <ReportMenu />
            <ShareButton />
          </div>
        </div>
        <Divider className="mt-4" />
      </div>
      <div className="col-start-1 row-start-3 px-10 py-2 text-gray-500">
        <div className="font-bold text-2xl pb-2 ">About this item</div>
        {productData.description}
      </div>

      <div className="row-span-1 col-start-2 row-start-2 items-end content-end mb-2">
        <div className="flex flex-col gap-4 items-end content-end">
          <AddToCartButton price={formatPrice(productData.price)} />
          <br />
          <BuyNowButton
            icon="shoppingBag"
            price={formatPrice(productData.price)}
          />
        </div>
      </div>
      <div className="mt-3"> Shipping Information Page</div>
    </div>
  );
};

export default ProductBody;
