import SeeMore from "./SeeMore";
import { Link } from "react-router-dom";
import BookBandButton from "./BookBand";
import BuyMerchButton from "./BuyMerch";
import { BandData } from "./bandinfo";
import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  Key,
} from "react";

interface BandProps {
  isDescriptionOn: boolean;
  bandData: BandData;
}

const BandInfoHead: React.FC<BandProps> = ({
  isDescriptionOn = false,
  bandData,
}) => {
  function descriptionOn(desc: Boolean) {
    if (desc) {
      return <BookBandButton theme="music" size="lg" />;
    } else return <BuyMerchButton theme="merch" size="lg" />;
  }

  // Format members list for SeeMore component with preserved styling
  const membersText =
    bandData?.member_list
      .map(
        (member: { band_role: any; member_name: any }) =>
          `※ (${member.band_role}) ${member.member_name}`
      )
      .join("\n") || "";

  // Render members list with proper line breaks
  const renderMembersList = () => {
    return bandData?.member_list.map(
      (
        member: {
          band_role:
            | string
            | number
            | boolean
            | ReactElement<any, string | JSXElementConstructor<any>>
            | Iterable<ReactNode>
            | ReactPortal
            | null
            | undefined;
          member_name:
            | string
            | number
            | boolean
            | ReactElement<any, string | JSXElementConstructor<any>>
            | Iterable<ReactNode>
            | ReactPortal
            | null
            | undefined;
        },
        index: Key | null | undefined
      ) => (
        <div key={index} className="mb-1 last:mb-0">
          ※ ({member.band_role}) {member.member_name}
        </div>
      )
    );
  };

  return (
    <div>
      <div className="grid grid-cols-[auto_1fr] auto-rows-auto gap-5">
        <div className="row-span-2 justify-items-center">
          {/* Force 1:1 aspect ratio with proper styling */}
          <div className="w-70 h-70 overflow-hidden rounded-lg bg-gray-200">
            <img
              src={bandData.pfp_string}
              alt="band image"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="col-span-2">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-6xl font-bold uppercase">
                <Link to={{ pathname: `/bandinfo/${bandData.branch_id}` }}>
                  {bandData.name}
                </Link>
              </h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                {bandData.genre}
              </span>
            </div>

            <div className="pt-3">
              <SeeMore maxLines={2} text={bandData.description} />
            </div>
          </div>
        </div>
        <div className="col-start-2 row-start-2 items-start">
          <h2 className="font-semibold text-lg mb-2">Band Members:</h2>
          {bandData.member_list.length > 4 ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <SeeMore
                maxLines={4}
                text={membersText}
                className="whitespace-pre-line"
              />
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {renderMembersList()}
            </div>
          )}
        </div>
        <div className="col-start-3 row-start-2 flex items-center">
          <div className="">{descriptionOn(isDescriptionOn)}</div>
        </div>
      </div>
      <div>
        <br />
        <div dangerouslySetInnerHTML={{ __html: bandData.iframe_string }} />
      </div>
      <br />
    </div>
  );
};

export default BandInfoHead;
