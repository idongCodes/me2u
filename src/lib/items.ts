export interface ShopItem {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: '1',
    name: 'Vintage Denim Jacket',
    price: 25,
    description: 'Lightly used denim jacket, perfect for fall. No tears or stains. Size Medium.',
    images: ['/shopping.svg', '/phone-hero.svg', '/window.svg']
  },
  {
    id: '2',
    name: 'Smart Watch Series 4',
    price: 85,
    description: 'Good condition, minor scratches on the side. Charger included.',
    images: ['/phone-hero.svg']
  },
  {
    id: '3',
    name: 'Mechanical Keyboard',
    price: 45,
    description: 'RGB lighting, Blue switches. Works perfectly.',
    images: ['/window.svg']
  }
];
