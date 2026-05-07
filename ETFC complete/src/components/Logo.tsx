import { motion } from 'framer-motion';

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = {
    sm: { container: 'w-10 h-10', text: 'text-lg', sub: 'text-[6px]' },
    md: { container: 'w-14 h-14', text: 'text-2xl', sub: 'text-[8px]' },
    lg: { container: 'w-20 h-20', text: 'text-3xl', sub: 'text-xs' },
    xl: { container: 'w-32 h-32', text: 'text-5xl', sub: 'text-sm' },
  };

  const s = sizes[size];

  return (
    <motion.div
      className={`${s.container} relative flex items-center justify-center`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 via-red-600 to-amber-500 p-[2px]">
        <div className="w-full h-full rounded-full bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <span className={`${s.text} font-['Bebas_Neue'] font-bold bg-gradient-to-r from-amber-400 via-red-500 to-amber-400 bg-clip-text text-transparent leading-none`}>
              E
            </span>
          </div>
        </div>
      </div>
      {/* Glowing effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-red-600/20 blur-md -z-10" />
    </motion.div>
  );
}

export function LogoFull({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };
  const subSizes = {
    sm: 'text-[8px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className="flex items-center gap-3">
      <Logo size={size} />
      <div className="flex flex-col">
        <motion.span
          className={`${textSizes[size]} font-['Orbitron'] font-black bg-gradient-to-r from-amber-400 via-red-500 to-amber-400 bg-clip-text text-transparent tracking-wider`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          ETFC
        </motion.span>
        <motion.span
          className={`${subSizes[size]} text-amber-400/70 font-['Inter'] tracking-[0.2em] uppercase`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Ethiopian Fighting Champs
        </motion.span>
      </div>
    </div>
  );
}
