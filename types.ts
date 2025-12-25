
export interface Book {
  id: string;
  title: string;
  author: string;
  addedAt: number;
  insight?: string;
  category?: string;
  isGenerating?: boolean;
}

export interface BookInsightResponse {
  insight: string;
  category: string;
}
