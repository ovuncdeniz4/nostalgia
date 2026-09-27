// Bundled category decks. Locked decks stay visible and cannot be played.

export interface Category {
  id: string;
  title: string;
  emoji: string;
  description: string;
  image: string;
  locked: boolean;
}

export const categories: Category[] = [
  {
    id: 'movies',
    title: 'Film & Dizi',
    emoji: '🎬',
    description:
      "90'lar ve 2000'lerde bir nesli şekillendiren ikonik filmler, diziler ve unutulmaz karakterler hakkındaki bilgini test et.",
    image:
      'https://images.unsplash.com/photo-1759577168838-5f8382e23cee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    locked: false,
  },
  {
    id: 'music',
    title: 'Hit Şarkılar',
    emoji: '🎵',
    description:
      "Boy band'lerden pop prenseslerine, 90'lar ve 2000'lerin en büyük hitlerini ve tek şarkılık fenomenlerini hatırlıyor musun?",
    image:
      'https://images.unsplash.com/photo-1550346210-5fe6c60e1816?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    locked: false,
  },
  {
    id: 'toys',
    title: 'Çocukluk Oyuncakları',
    emoji: '🧸',
    description:
      'Tamagotchi, Beanie Babies ve Pokémon kartlarını hatırlıyor musun? Çocukluğumuzu büyülü kılan oyuncakların dünyasına dal.',
    image:
      'https://images.unsplash.com/photo-1760811732202-67e756b28b52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    locked: false,
  },
  {
    id: 'commercials',
    title: 'Klasik Reklamlar',
    emoji: '📺',
    description: 'Kafana yapışan jingleları ve sloganları hatırlıyor musun? Reklam bilgini test et!',
    image:
      'https://images.unsplash.com/photo-1749594536321-873a097445d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    locked: true,
  },
  {
    id: 'events',
    title: 'Ünlü Olaylar',
    emoji: '🌟',
    description:
      'Y2K, milenyum kutlamaları ve büyük kültürel anlar. O dönemi şekillendiren olayları ne kadar iyi hatırlıyorsun?',
    image:
      'https://images.unsplash.com/photo-1666861986943-b78b9cafd208?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    locked: true,
  },
  {
    id: 'arcade',
    title: 'Arcade Oyunları',
    emoji: '🎮',
    description:
      'PlayStation, Nintendo 64 ve arcade klasikleri. Oyun çocukluklarını tanımlayan oyunlar hakkındaki bilgini test et.',
    image:
      'https://images.unsplash.com/photo-1759171053096-e7dbe7c36eb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    locked: true,
  },
];

export function findCategory(categoryId: string | undefined): Category | undefined {
  return categories.find((category) => category.id === categoryId);
}
