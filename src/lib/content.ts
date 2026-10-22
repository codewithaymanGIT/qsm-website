// The only way pages read content. Phase 2 replaces these bodies with
// database queries; signatures stay the same.
import { categories } from "@/content/categories";
import { products } from "@/content/products";
import { services } from "@/content/services";
import { gallery, partners, settings, timeline } from "@/content/site";
import type { Category, Product } from "@/content/types";

export const getCategories = (): Category[] =>
  [...categories].sort((a, b) => a.order - b.order);

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

export const getProducts = () => products;

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const getProductsByCategory = (slug: string) =>
  products.filter((p) => p.categorySlug === slug);

export function getRelatedProducts(slug: string, limit = 3): Product[] {
  const product = getProduct(slug);
  if (!product) return [];
  const others = products.filter((p) => p.slug !== slug);
  const sameCategory = others.filter((p) => p.categorySlug === product.categorySlug);
  const rest = others.filter((p) => p.categorySlug !== product.categorySlug);
  return [...sameCategory, ...rest].slice(0, limit);
}

export const getServices = () => services;

export const getService = (slug: string) => services.find((s) => s.slug === slug);

export const getGallery = () => gallery;

export const getPartners = () => partners;

export const getTimeline = () => timeline;

export const getSettings = () => settings;
