export type Topic =
  | "product-design"
  | "ux-research"
  | "ai-tools"
  | "ai-research"
  | "iot-hardware"
  | "aiot"
  | "smart-agriculture"
  | "career-signals"
  | "in-the-world";

export type Story = {
  id: string;
  topic: Topic;
  headline: string;
  dek: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  imageCredit?: string;
  isHero?: boolean;
  publishedAt: string;
};

export type Digest = {
  date: string;
  heroStoryId: string;
  stories: Story[];
};
