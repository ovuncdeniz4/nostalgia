// Bundled category decks. Photos live in assets so the cards work offline.

import { ImageSourcePropType } from 'react-native';

export interface Category {
  id: string;
  title: string;
  emoji: string;
  description: string;
  image: ImageSourcePropType;
  locked: boolean;
}

export const categories: Category[] = [
  {
    id: 'movies',
    title: 'Film & Dizi',
    emoji: '🎬',
    description:
      "90'lar ve 2000'lerde bir nesli şekillendiren ikonik filmler, diziler ve unutulmaz karakterler hakkındaki bilgini test et.",
    image: require('../../assets/images/categories/movies.jpg'),
    locked: false,
  },
  {
    id: 'music',
    title: 'Hit Şarkılar',
    emoji: '🎵',
    description:
      "Boy band'lerden pop prenseslerine, 90'lar ve 2000'lerin en büyük hitlerini ve tek şarkılık fenomenlerini hatırlıyor musun?",
    image: require('../../assets/images/categories/music.jpg'),
    locked: false,
  },
  {
    id: 'toys',
    title: 'Çocukluk Oyuncakları',
    emoji: '🧸',
    description:
      'Tamagotchi, Taso ve Pokémon kartlarını hatırlıyor musun? Çocukluğumuzu büyüten oyuncakların dünyasına dal.',
    image: require('../../assets/images/categories/toys.jpg'),
    locked: false,
  },
  {
    id: 'commercials',
    title: 'Klasik Reklamlar',
    emoji: '📺',
    description: 'Kafana yapışan jingleları ve sloganları hatırlıyor musun? Reklam bilgini test et!',
    image: require('../../assets/images/categories/commercials.jpg'),
    locked: true,
  },
  {
    id: 'events',
    title: 'Ünlü Olaylar',
    emoji: '🌟',
    description:
      'Y2K, milenyum kutlamaları ve büyük kültürel anlar. O dönemi şekillendiren olayları ne kadar iyi hatırlıyorsun?',
    image: require('../../assets/images/categories/events.jpg'),
    locked: true,
  },
  {
    id: 'arcade',
    title: 'Arcade Oyunları',
    emoji: '🎮',
    description:
      'PlayStation, Nintendo 64 ve arcade klasikleri. Oyun çocukluklarını tanımlayan oyunlar hakkındaki bilgini test et.',
    image: require('../../assets/images/categories/arcade.jpg'),
    locked: true,
  },
];

export function findCategory(categoryId: string | undefined): Category | undefined {
  return categories.find((category) => category.id === categoryId);
}
