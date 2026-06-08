import { Metadata } from "next";
import { getShopItemById } from "@/app/actions/shop-items";
import { notFound } from "next/navigation";
import ItemDetailsClient from "./ItemDetailsClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const item = await getShopItemById(resolvedParams.id);

  if (!item) {
    return {
      title: "Item Not Found",
    };
  }

  const title = `${item.name} - $${item.price}`;
  const description = `${
    item.status === "available" ? "Available" : "Unavailable"
  } - ${item.description.substring(0, 150)}${
    item.description.length > 150 ? "..." : ""
  }`;
  // Use the first image if available, else a fallback or relative path
  // If the image is a relative path starting with /, it might need the base URL for Open Graph to work properly in all clients, but Next.js usually handles full URL generation if metadataBase is set. Since we don't know if metadataBase is set, relative works for some scrapers or we just provide what we have.
  const imageUrl = item.images?.[0] || "/undraw_online-shopping_po8w.svg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const item = await getShopItemById(resolvedParams.id);

  if (!item) {
    notFound();
  }

  return <ItemDetailsClient item={item} />;
}
