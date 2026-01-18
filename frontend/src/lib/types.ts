export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  dosage?: string | null;
  volume?: string | null;
  retailPrice: number;
  wholesalePrice: number;
  wholesaleMinQty: number;
  status: "active" | "soon" | "archived";
  imageUrl?: string | null;
};
