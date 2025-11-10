import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface SkeletonGridProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  showImage?: boolean;
}

export const SkeletonGrid = ({ 
  count = 6, 
  columns = 3,
  showImage = false 
}: SkeletonGridProps) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          {showImage && (
            <Skeleton className="h-48 w-full bg-white/10" />
          )}
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4 bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-2/3 bg-white/10" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

