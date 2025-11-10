import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface SkeletonListProps {
  count?: number;
  showAvatar?: boolean;
}

export const SkeletonList = ({ count = 3, showAvatar = false }: SkeletonListProps) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {showAvatar && (
                <Skeleton className="h-12 w-12 rounded-full bg-white/10 flex-shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4 bg-white/10" />
                <Skeleton className="h-4 w-1/2 bg-white/10" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

