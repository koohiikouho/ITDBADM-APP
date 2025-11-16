import { Image } from "@heroui/react";
import SeeMore from "./SeeMore";
import { Link } from "react-router-dom";
import BookBandButton from "./BookBand";
import BuyMerchButton from "./BuyMerch";

interface BandProps {
  isDescriptionOn: boolean;
}

const BandInfoHead: React.FC<BandProps> = ({ isDescriptionOn = false }) => {
  function descriptionOn(desc: Boolean) {
    if (desc) {
      return <BookBandButton theme="music" size="lg" />;
    } else return <BuyMerchButton theme="merch" size="lg" />;
  }

  return (
    <div>
      <div className="grid grid-cols-[auto_1fr] auto-rows-auto gap-5">
        <div className="row-span-2 justify-items-center max-w-75">
          <Image
            isBlurred
            isZoomed
            alt="band image"
            className=""
            src="https://i.scdn.co/image/ab6761610000517438df323a9b0d7880ae59590b"
          ></Image>
        </div>
        <div className="col-span-2">
          <div>
            <div>
              <h1 className="text-6xl font-bold uppercase">
                <Link to={{ pathname: "/bandinfo" }}>kessoku band</Link>
              </h1>
            </div>

            <div className="pt-3">
              <SeeMore
                maxLines={2}
                text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eu magna sit amet risus interdum rutrum. Donec sit amet aliquet tortor. Curabitur nec facilisis velit. Praesent aliquam diam in augue tincidunt, ac aliquam sapien cursus. Nullam molestie mattis nulla, ut porttitor dui pharetra sit amet. Vivamus accumsan facilisis tristique. Ut tempor pellentesque pretium. Donec scelerisque dui justo, in aliquet augue hendrerit tincidunt. Morbi quis nisi vel sem consectetur tristique non et justo. In consectetur nunc hendrerit ligula vulputate, vulputate aliquet nisi pulvinar. "
              />
            </div>
          </div>
        </div>
        <div className="col-start-2 row-start-2 items-start">
          <h2>Band Members:</h2>
          <ul>
            <li>※ (Vo. & Git.) Ikuyo Kita</li>
            <li>※ (Gt. & Vo.) Hitori "Bocchi" Gotō</li>
            <li>※ (Ba.) Ryō Yamada</li>
            <li>※ (Dr.) Nijika Ijichi</li>
          </ul>
        </div>
        <div className="col-start-3 row-start-2 flex items-center">
          <div className="">{descriptionOn(isDescriptionOn)}</div>
        </div>
      </div>
      <div>
        <br />
        <iframe
          src="https://open.spotify.com/embed/artist/2nvl0N9GwyX69RRBMEZ4OD?utm_source=generator"
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
      <br />
    </div>
  );
};

export default BandInfoHead;
