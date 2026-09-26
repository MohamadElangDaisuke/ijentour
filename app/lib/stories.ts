export type Story = {
  id: string;
  title: string;
  image: string;
};

export const defaultStories: Story[] = [
  {
    id: "blue-fire-at-dawn",
    title: "Blue Fire at Dawn",
    image: "/images/pkg-bluefire.png",
  },
  {
    id: "the-crater-walk",
    title: "The Crater Walk",
    image: "/images/pkg-crater.png",
  },
  {
    id: "into-the-wild",
    title: "Into the Wild",
    image: "/images/ijen-expedition-tour.webp",
  },
  {
    id: "stories-of-ijen",
    title: "Stories of Ijen",
    image: "/images/the-best-view-of-kawah.webp",
  },
];

export const storiesStorageKey = "ijen-tour-stories";
