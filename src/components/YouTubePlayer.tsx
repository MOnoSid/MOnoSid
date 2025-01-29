import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface YouTubePlayerProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, isOpen, onClose }) => {
  if (!videoId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubePlayer;
