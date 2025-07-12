import { Card, CardTitle, CardDescription } from "./ui/card";

interface ImageProps {
  id: number;
  title: string;
  description: string;
  date_created: string;
  user_id: string;
  url: string;
}

const Image = ({ title, description, url }: ImageProps) => {
  return (
    <Card className="px-2">
      <img src={url} alt={title} className="w-full h-auto rounded-lg" />
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
      {/* Additional content can be added here */}
    </Card>
  );
};

export default Image; // Export Image component
