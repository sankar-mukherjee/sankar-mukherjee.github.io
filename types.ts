export interface IndexEntry {
  id: string;
  title: string;
  content?: string; // Path to the markdown content file
  children?: IndexEntry[];
}

export enum Page {
  About = 'about',
  Blog = 'blog',
}