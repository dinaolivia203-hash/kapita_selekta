export const CATEGORIES = {
  berita: "Berita",
  prestasi: "Prestasi",
  kegiatan: "Kegiatan",
} as const;

export type Category = keyof typeof CATEGORIES;

export type Post = {
  id: number;
  title: string;
  slug: string;
  category: Category;
  excerpt: string;
  content: string;
  image: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Admin = {
  id: number;
  username: string;
  name: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

export function isCategory(value: string): value is Category {
  return Object.prototype.hasOwnProperty.call(CATEGORIES, value);
}

export function categoryLabel(value: string): string {
  return isCategory(value) ? CATEGORIES[value] : "Berita";
}
