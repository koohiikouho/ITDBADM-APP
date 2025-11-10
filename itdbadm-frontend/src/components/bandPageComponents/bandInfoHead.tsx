import { Image } from "@heroui/react";

interface BandProps {
  isDescriptionOn: boolean;
}

const BandInfoHead: React.FC<BandProps> = ({ isDescriptionOn = false }) => {
  function descriptionOn(desc: Boolean) {
    if (desc) {
      return (
        <p className="text-gray-600 dark:text-gray-400">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed diam
          lacus, condimentum id mauris at, dignissim dapibus lorem. In quis
          lectus id arcu pretium pharetra. Integer tellus nunc, facilisis vel
          justo volutpat, convallis aliquam ipsum. Curabitur blandit turpis ac
          felis lacinia ultrices. Aenean iaculis mauris bibendum semper
          fermentum.
        </p>
      );
    }
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
          <h1 className="text-7xl font-bold uppercase">kessoku band</h1>
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
        <div className="col-start-3 row-start-2">Button To Hire Them</div>
        <div className="col-span-3 row-start-3">
          {descriptionOn(isDescriptionOn)}
        </div>
      </div>
      <br />
    </div>
  );
};

export default BandInfoHead;
