import { motion } from 'framer-motion';

interface SpoilerOverlayProps {
  onReveal: () => void;
}

export default function SpoilerOverlay({ onReveal }: SpoilerOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      onClick={onReveal}
      className="fixed inset-0 flex flex-col items-center justify-center cursor-pointer select-none group"
      style={{
        backdropFilter: 'blur(28px) brightness(0.35)',
        WebkitBackdropFilter: 'blur(28px) brightness(0.35)',
        backgroundColor: 'rgba(13, 17, 23, 0.7)',
        zIndex: 9999,
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex flex-col items-center gap-3 text-center"
      >
        {/* Beautiful glassmorphic badge for the title */}
        <div className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 group-hover:scale-105 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <span 
            className="text-lg font-bold tracking-[0.25em] text-white uppercase"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Spoiler Alert
          </span>
        </div>
        
        {/* Subtle subtext instruction */}
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 transition-colors duration-300 group-hover:text-white/50">
          Click anywhere to reveal
        </span>
      </motion.div>
    </motion.div>
  );
}
