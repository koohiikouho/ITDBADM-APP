import ProductGrid from "./ProductCard";

interface BandInfoBodyProps {
  bandId: string | undefined;
}

export default function BandInfoBody({ bandId }: BandInfoBodyProps) {
  console.log("BandInfoBody - Received bandId:", bandId);
  return (
    <div>
      <ProductGrid bandId={bandId} />
    </div>
  );
}
