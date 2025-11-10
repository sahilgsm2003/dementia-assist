import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export const MemoryStoryBuilder = () => {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardContent className="p-12 text-center">
        <BookOpen className="h-12 w-12 text-white/30 mx-auto mb-4" />
        <p className="text-white/70 mb-2">Memory Stories</p>
        <p className="text-sm text-white/50">
          Group your memories into beautiful stories and narratives. Coming soon!
        </p>
      </CardContent>
    </Card>
  );
};

