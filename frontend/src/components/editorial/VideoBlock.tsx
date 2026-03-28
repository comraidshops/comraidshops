'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import Image from 'next/image';

interface VideoBlockProps {
  video_url?: string;
  video_provider?: 'youtube' | 'vimeo' | 'cloudinary';
  video_thumbnail?: string;
  title?: string;
}

export default function VideoBlock({ video_url, video_provider, video_thumbnail, title }: VideoBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  if (!video_url) return null;

  const getEmbedUrl = (url: string, provider?: string) => {
    if (provider === 'youtube') {
      const videoId = extractYoutubeId(url);
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0`;
    }
    if (provider === 'vimeo') {
      const videoId = extractVimeoId(url);
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0&badge=0&autopause=0&player_id=0&app_id=58479`;
    }
    return url;
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const extractVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    return match ? match[1] : null;
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  // Optimization: For Cloudinary, add q_auto,f_auto if not present
  const optimizedUrl = (url: string, provider?: string) => {
    if (provider === 'cloudinary' && url.includes('res.cloudinary.com')) {
      if (!url.includes('q_auto')) {
        return url.replace('/upload/', '/upload/q_auto,f_auto/');
      }
    }
    return url;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full aspect-video rounded-sm md:rounded-lg overflow-hidden bg-black/5 mb-24 cursor-pointer group shadow-2xl ring-1 ring-border/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={!isPlaying ? handlePlay : undefined}
    >
      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <motion.div 
            key="thumbnail"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            {video_thumbnail ? (
              <Image 
                src={video_thumbnail} 
                alt={title || "Video thumbnail"}
                fill
                className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                 <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">Editorial Film</span>
              </div>
            )}
            
            {/* Cinematic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 group-hover:from-black/10 group-hover:to-black/40 transition-all duration-700" />
            
            {/* Play Button Wrapper */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: isHovered ? 1.05 : 1,
                  opacity: isHovered ? 1 : 0.8
                }}
                className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-xl border border-white/20 text-white shadow-2xl transition-colors group-hover:bg-white/10"
              >
                <div className="relative">
                     <Play fill="currentColor" size={32} className="ml-1 relative z-10" />
                     <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 -m-4 rounded-full bg-white opacity-20 blur-xl"
                     />
                </div>
              </motion.div>
            </div>

            {/* Title Label */}
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:flex">
                <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/50">Cinematic Layer</p>
                    <h4 className="text-xl font-bold uppercase tracking-tighter text-white font-playfair italic underline decoration-white/20 underline-offset-8">Watch the Feature.</h4>
                </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 bg-black"
          >
            {video_provider === 'cloudinary' ? (
              <video 
                src={optimizedUrl(video_url, video_provider)}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <iframe
                src={getEmbedUrl(video_url, video_provider)}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; picture-in-view; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title || "Video player"}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
