// ============================================================
// VIVOKID — TrustBloom — La signature visuelle unique
// Une fleur qui s'ouvre selon le Trust Score.
// Pas une barre de progression. Un bloom.
// ============================================================
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getTrustLevel, TRUST_LEVELS } from '@kido/shared';

interface Props { score: number; size?: number; animated?: boolean; }

const PETAL_COLORS = {
  seedling: ['#86efac','#4ade80','#22c55e','#16a34a','#15803d'],
  growing:  ['#fda4af','#fb7185','#f43f5e','#e11d48','#be123c'],
  reliable: ['#fde68a','#fcd34d','#fbbf24','#f59e0b','#d97706'],
  excellent:['#67e8f9','#22d3ee','#06b6d4','#0891b2','#0e7490'],
  champion: ['#86efac','#34d399','#10b981','#059669','#047857'],
};

export function TrustBloom({ score, size = 120, animated = true }: Props) {
  const level = getTrustLevel(score);
  const def   = TRUST_LEVELS[level];
  const ratio = (score - def.min) / (def.max - def.min);
  const petalCount = 5 + Math.round(ratio * 3); // 5→8 petals as score rises
  const colors = PETAL_COLORS[level];

  const petals = useMemo(() => {
    return Array.from({ length: petalCount }, (_, i) => {
      const angle     = (i / petalCount) * 360;
      const petalLen  = size * 0.35 * (0.7 + ratio * 0.3);
      const petalW    = size * 0.14 * (0.8 + ratio * 0.2);
      const color     = colors[i % colors.length];
      return { angle, petalLen, petalW, color, delay: i * 0.08 };
    });
  }, [petalCount, size, ratio, colors]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Petals */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
        {petals.map((p, i) => {
          const cx = size / 2, cy = size / 2;
          const rad = (p.angle - 90) * Math.PI / 180;
          const tip = { x: cx + Math.cos(rad) * p.petalLen, y: cy + Math.sin(rad) * p.petalLen };
          const lRad = (p.angle - 90 - 25) * Math.PI / 180;
          const rRad = (p.angle - 90 + 25) * Math.PI / 180;
          const lc = { x: cx + Math.cos(lRad) * p.petalLen * 0.7, y: cy + Math.sin(lRad) * p.petalLen * 0.7 };
          const rc = { x: cx + Math.cos(rRad) * p.petalLen * 0.7, y: cy + Math.sin(rRad) * p.petalLen * 0.7 };
          return (
            <motion.path
              key={i}
              d={`M ${cx} ${cy} Q ${lc.x} ${lc.y} ${tip.x} ${tip.y} Q ${rc.x} ${rc.y} ${cx} ${cy}`}
              fill={p.color} fillOpacity={0.85}
              initial={animated ? { scale: 0, opacity: 0, originX: `${cx}px`, originY: `${cy}px` } : {}}
              animate={animated ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: p.delay, duration: 0.5, ease: [0.34,1.56,0.64,1] }}
            />
          );
        })}
        {/* Center circle */}
        <motion.circle
          cx={size/2} cy={size/2} r={size * 0.13}
          fill={colors[2]}
          initial={animated ? { scale: 0 } : {}}
          animate={animated ? { scale: 1 } : {}}
          transition={{ delay: petalCount * 0.08 + 0.1, duration: 0.4, ease: 'backOut' }}
        />
        {/* Score text */}
        <motion.text
          x={size/2} y={size/2 + 5}
          textAnchor="middle" fontSize={size * 0.13}
          fontWeight="900" fill="white" fontFamily="DM Sans"
          initial={animated ? { opacity: 0 } : {}}
          animate={animated ? { opacity: 1 } : {}}
          transition={{ delay: petalCount * 0.08 + 0.3 }}
        >
          {score}
        </motion.text>
      </svg>
    </div>
  );
}

// Mini inline version for lists
export function TrustBadge({ score }: { score: number }) {
  const level = getTrustLevel(score);
  const def   = TRUST_LEVELS[level];
  const colors = PETAL_COLORS[level];
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ background: colors[2] }}>
        {def.icon}
      </div>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden" style={{ width: 48 }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: colors[2] }} />
      </div>
      <span className="text-xs font-bold" style={{ color: colors[2] }}>{score}</span>
    </div>
  );
}
