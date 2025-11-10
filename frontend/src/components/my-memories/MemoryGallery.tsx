import { motion } from "framer-motion";
import { MemoryCard } from "./MemoryCard";
import { useNavigate } from "react-router-dom";

interface MemoryPhoto {
  id: number;
  description?: string;
  image_url: string;
  created_at: string;
}

interface MemoryGalleryProps {
  memories: MemoryPhoto[];
  onRefresh: () => void;
}

export const MemoryGallery = ({ memories, onRefresh }: MemoryGalleryProps) => {
  const navigate = useNavigate();

  if (memories.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 rounded-xl border border-dashed border-white/15 bg-black/20">
        <p className="text-sm text-white/60">No memories in this collection</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {memories.map((memory, index) => (
        <motion.div
          key={memory.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
          onClick={() => navigate(`/my-memories/${memory.id}`)}
        >
          <MemoryCard memory={memory} />
        </motion.div>
      ))}
    </div>
  );
};

