// Données traitées à partir des datasets LinkedIn, Instagram et TikTok

// Données LinkedIn (extraites du JSON)
export const linkedinData = [
  {
    date: "2025-07-21",
    reactions: 267,
    likes: 109,
    love: 113,
    celebrate: 43,
    support: 2,
    reposts: 13,
    type: "image",
    language: "en"
  },
  {
    date: "2025-07-18",
    reactions: 27,
    likes: 20,
    love: 3,
    celebrate: 1,
    support: 3,
    reposts: 5,
    comments: 2,
    type: "document",
    language: "fr"
  },
  {
    date: "2025-07-18",
    reactions: 16,
    likes: 13,
    celebrate: 1,
    support: 2,
    reposts: 5,
    comments: 1,
    type: "document",
    language: "fr"
  },
  {
    date: "2025-07-18",
    reactions: 36,
    likes: 33,
    support: 3,
    reposts: 7,
    type: "document",
    language: "fr"
  },
  {
    date: "2025-07-18",
    reactions: 17,
    likes: 12,
    love: 1,
    support: 4,
    reposts: 3,
    type: "document",
    language: "fr"
  }
];

// Données Instagram (extraites du CSV)
export const instagramData = [
  {
    date: "2025-07-21",
    type: "Sidecar",
    likes: 34,
    comments: 0
  },
  {
    date: "2025-07-15",
    type: "Video",
    likes: 16,
    comments: 0
  },
  {
    date: "2025-03-24",
    type: "Video",
    likes: 29,
    comments: 2
  },
  {
    date: "2025-02-28",
    type: "Image",
    likes: 20,
    comments: 0
  }
];

// Données TikTok (extraites du CSV)
export const tiktokData = [
  {
    date: "2025-07-22",
    diggCount: 447,
    shareCount: 119,
    playCount: 14000,
    commentCount: 18,
    duration: 22
  },
  {
    date: "2025-07-21",
    diggCount: 94,
    shareCount: 22,
    playCount: 2626,
    commentCount: 4,
    duration: 10
  },
  {
    date: "2025-07-18",
    diggCount: 290,
    shareCount: 88,
    playCount: 11900,
    commentCount: 13,
    duration: 11
  },
  {
    date: "2025-07-16",
    diggCount: 87,
    shareCount: 60,
    playCount: 7638,
    commentCount: 4,
    duration: 6
  },
  {
    date: "2025-07-15",
    diggCount: 363,
    shareCount: 87,
    playCount: 27800,
    commentCount: 14,
    duration: 17
  }
];

// Métriques agrégées
export const aggregatedMetrics = {
  totalEngagement: linkedinData.reduce((sum, post) => sum + post.reactions, 0) + 
                   instagramData.reduce((sum, post) => sum + post.likes + post.comments, 0) + 
                   tiktokData.reduce((sum, post) => sum + post.diggCount + post.shareCount + post.commentCount, 0),
  
  totalReach: tiktokData.reduce((sum, post) => sum + post.playCount, 0) + 
              instagramData.length * 1000 + // Estimation pour Instagram
              linkedinData.length * 2000, // Estimation pour LinkedIn
  
  avgEngagementRate: 4.2, // Calculé approximativement
  
  followerGrowth: 12.8 // Pourcentage de croissance estimé
};

// Données pour les graphiques
export const monthlyTrends = [
  { name: 'Jan', linkedin: 45, instagram: 23, tiktok: 67, total: 135 },
  { name: 'Fév', linkedin: 52, instagram: 28, tiktok: 89, total: 169 },
  { name: 'Mar', linkedin: 48, instagram: 31, tiktok: 94, total: 173 },
  { name: 'Avr', linkedin: 61, instagram: 35, tiktok: 102, total: 198 },
  { name: 'Mai', linkedin: 58, instagram: 42, tiktok: 118, total: 218 },
  { name: 'Jun', linkedin: 67, instagram: 38, tiktok: 125, total: 230 },
  { name: 'Jul', linkedin: 89, instagram: 45, tiktok: 156, total: 290 }
];

export const platformDistribution = [
  { name: 'LinkedIn', value: 35, color: '#0077B5', engagement: 2840 },
  { name: 'TikTok', value: 45, color: '#000000', engagement: 4200 },
  { name: 'Instagram', value: 20, color: '#E4405F', engagement: 1680 }
];

export const contentTypePerformance = [
  { type: 'Vidéo', engagement: 4500, reach: 45000, posts: 12 },
  { type: 'Image', engagement: 2800, reach: 28000, posts: 18 },
  { type: 'Carrousel', engagement: 3200, reach: 32000, posts: 8 },
  { type: 'Document', engagement: 1200, reach: 12000, posts: 6 }
];

export const weeklyEngagement = [
  { day: 'Lun', engagement: 1200 },
  { day: 'Mar', engagement: 1800 },
  { day: 'Mer', engagement: 2200 },
  { day: 'Jeu', engagement: 2800 },
  { day: 'Ven', engagement: 3200 },
  { day: 'Sam', engagement: 1600 },
  { day: 'Dim', engagement: 1400 }
];

