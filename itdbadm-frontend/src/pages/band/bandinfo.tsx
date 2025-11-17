import AnimatedContent from "@/components/AnimatedContent";
import BandInfoBody from "@/components/bandPageComponents/bandInfoBody";
import BandInfoHead from "@/components/bandPageComponents/bandInfoHead";
import DefaultLayout from "@/layouts/default";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "@/lib/api";

interface BandMember {
  band_role: string;
  member_name: string;
}

export interface BandData {
  branch_id: number;
  name: string;
  genre: string;
  description: string;
  iframe_string: string;
  pfp_string: string;
  member_list: BandMember[];
}
export default function BandInfo() {
  const { bandId } = useParams<{ bandId: string }>();
  const [bandData, setBandData] = useState<BandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBandData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("BandInfo - bandId from useParams:", bandId);

        if (!bandId) {
          throw new Error("No band bandId found in URL");
        }

        console.log("Fetching from:", apiClient.baseURL + `/bands/${bandId}`);

        const response = await fetch(apiClient.baseURL + `/bands/${bandId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch band data: ${response.status}`);
        }

        const data: BandData[] = await response.json();
        console.log("API Response:", data);

        if (data && data.length > 0) {
          setBandData(data[0]);
        } else {
          throw new Error("No band data found for this bandId");
        }
      } catch (err) {
        console.error("Error fetching band data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if bandId exists
    if (bandId) {
      fetchBandData();
    } else {
      setLoading(false);
      setError("No band ID found in URL");
    }
  }, [bandId]);

  // Show loading/error states including when bandId is undefined
  if (loading || !bandId) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">Loading band information...</div>
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center py-8">
          <div className="text-lg text-red-500">Error: {error}</div>
          <div className="text-sm text-gray-500 mt-2">
            Band bandId: {bandId || "Not found"}
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!bandData) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">No band data found</div>
          <div className="text-sm text-gray-500 mt-2">
            Band bandId: {bandId}
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // At this point, TypeScript knows bandId is definitely a string
  // and bandData is definitely not null
  console.log("BandInfo - Passing bandId to BandInfoBody:", bandId);

  return (
    <DefaultLayout>
      <div className="mx-30">
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
          <BandInfoHead
            isDescriptionOn
            bandData={bandData}
            bandId={bandId}
            enableSpotify
          />
        </AnimatedContent>

        <BandInfoBody bandId={bandId} />
      </div>
    </DefaultLayout>
  );
}
