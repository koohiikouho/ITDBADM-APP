import { Avatar, Divider, Link } from "@heroui/react";
import Carousel from "./ImageCarousel";
import ShareButton from "./ShareButton";
import ReportMenu from "./Report";
import AddToCartButton from "./AddToCart";
import BuyNowButton from "./BuyNow";
import HeartButton from "./HeartButton";

const ProductBody: React.FC = () => {
  const sampleImages = [
    "https://img.amiami.com/images/product/main/243/FIGURE-175155.jpg",
    "https://img.amiami.com/images/product/review/243/FIGURE-175155_01.jpg",
    "https://img.amiami.com/images/product/review/243/FIGURE-175155_02.jpg",
    "https://img.amiami.com/images/product/review/243/FIGURE-175155_03.jpg",
    "https://img.amiami.com/images/product/review/243/FIGURE-175155_04.jpg",
    "https://img.amiami.com/images/product/review/243/FIGURE-175155_05.jpg",
    "https://img.amiami.com/images/product/review/243/FIGURE-175155_06.jpg",
    "https://img.amiami.com/images/product/review/243/FIGURE-175155_07.jpg",
    "https://img.amiami.com/images/product/review/243/FIGURE-175155_08.jpg",
    "https://img.amiami.com/images/product/review/243/FIGURE-175155_09.jpg",
    "https://img.amiami.com/images/product/review/243/FIGURE-175155_10.jpg",
    "https://img.amiami.com/images/product/review/243/FIGURE-175155_11.jpg",
    "https://img.amiami.com/images/product/review/243/FIGURE-175155_12.jpg",
  ];

  return (
    <div className="grid grid-cols-[65%_35%] grid-rows-3 gap-4">
      <div className="row-span-2">
        <Carousel images={sampleImages} />
      </div>
      <div className="flex flex-col p-2">
        <div className="flex">
          <Avatar
            size="sm"
            className="mr-2"
            src="https://i.scdn.co/image/ab6761610000517438df323a9b0d7880ae59590b"
          />
          <Link
            color="foreground"
            href="#"
            className="font-bold text-gray-400 dark:text-gray-100 text-xl"
          >
            Kessoku Band
          </Link>
        </div>
        <br />
        <div className="font-bold pt-3 text-3xl text-gray-500 dark:text-gray-50">
          TENITOL BOCCHI THE ROCK! Ryo Yamada Cafe Style ver. Complete Figure
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
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed diam lacus,
        condimentum id mauris at, dignissim dapibus lorem. In quis lectus id
        arcu pretium pharetra. Integer tellus nunc, facilisis vel justo
        volutpat, convallis aliquam ipsum. Curabitur blandit turpis ac felis
        lacinia ultrices. Aenean iaculis mauris bibendum semper fermentum.
      </div>

      <div className="row-span-1 col-start-2 row-start-2 items-end content-end mb-2">
        <div className="flex flex-col gap-4 items-end content-end">
          <AddToCartButton price="4,851 JPY" />
          <br />
          <BuyNowButton icon="shoppingBag" price="4,851 JPY" />
        </div>
      </div>
      <div className="mt-3"> Shipping Information Page</div>
    </div>
  );
};

export default ProductBody;
