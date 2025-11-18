import { Avatar, Divider, Link } from "@heroui/react";
import Carousel from "./ImageCarousel";
import ShareButton from "./ShareButton";
import ReportMenu from "./Report";
import AddToCartButton from "./AddToCart";
import BuyNowButton from "./BuyNow";
import HeartButton from "./HeartButton";
import { BandData } from "@/pages/band/bandinfo";
import { formatPrice, getCurrencyDisplay } from "@/lib/currencyFormatter";

interface ProductData {
  band_id: number;
  name: string;
  price: string;
  description: string;
  category: string;
  image: {
    url: string[]; // Changed from string to string[]
  };
}

interface ProductBodyProps {
  productData: ProductData;
  bandData: BandData;
}
import { useState } from "react";

import { TruckIcon, ClockIcon } from "@heroicons/react/24/outline";

const ShippingInfo = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 w-full h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TruckIcon className="w-5 h-5 " />
        Shipping Information
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <ClockIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">Ships within 24 hours</span>
        </div>

        <div className="flex items-center gap-3">
          <TruckIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            Free shipping on orders over $50
          </span>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-xs">Tracking number provided after shipment</p>
        </div>
      </div>
    </div>
  );
};

const ProductBody: React.FC<ProductBodyProps> = ({ productData, bandData }) => {
  // Use the product images array directly from the API response
  const productImages = productData.image.url;

  // Format price to JPY

  return (
    <div className="grid grid-cols-[65%_35%] grid-rows-[auto_auto_1fr] gap-4 h-full">
      {/* Carousel - spans first two rows */}
      <div className="row-span-2">
        <Carousel images={productImages} />
      </div>

      {/* Band info and product title section */}
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

      {/* Product description */}
      <div className="col-start-1 row-start-3 px-10 py-2 text-gray-500">
        <div className="font-bold text-2xl pb-2 ">About this item</div>
        {productData.description}
      </div>

      {/* Action buttons */}
      <div className="row-span-1 col-start-2 row-start-2 items-start content-start mb-4">
        <div className="flex flex-col gap-4 items-start content-start">
          <AddToCartButton price={formatPrice(productData.price, "code")} />
          <br />
          <BuyNowButton
            icon="shoppingBag"
            price={formatPrice(productData.price, "code")}
          />
        </div>
      </div>

      {/* Shipping Info - now takes full container */}
      <div className="col-start-2 row-start-3">
        <ShippingInfo />
      </div>
    </div>
  );
};

export default ProductBody;
