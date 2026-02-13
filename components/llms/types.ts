export type LlmSubpart = {
  id: string;
  title: string;
  description: string;
  meta?: {
    lastUpdated?: string;
    keywords?: string;
  };
  borderless?: boolean;
  introTitle?: string;
  introParagraph?: string;
  introPoints?: string[];
  content: string[];
  sections?: string[];
  figures?: {
    title: string;
    description: string;
    src?: string;
    alt?: string;
    imageAfterTopicTitle?: string;
    images?: {
      src: string;
      alt: string;
    }[];
    topics?: {
      title: string;
      description: string;
      points?: string[];
    }[];
    groups?: {
      header: string;
      items: {
        title: string;
        description: string;
      }[];
    }[];
  }[];
  comparisons?: {
    title: string;
    description: string;
    beforeLabel: string;
    beforeCode: string;
    afterLabel: string;
    afterCode: string;
  }[];
  images?: { src: string; alt: string }[];
  snippets?: { title: string; description: string; code: string }[];
  codeLink?: string;
};

export type LlmPart = {
  id: string;
  title: string;
  summary: string;
  subparts: LlmSubpart[];
};
