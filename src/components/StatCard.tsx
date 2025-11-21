import { motion } from 'framer-motion';
import clsx from 'clsx';

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  onClick?: () => void;
  pulse?: boolean;
}

export const StatCard = ({ title, value, subtitle, onClick, pulse }: Props) => (
  <motion.button
    type="button"
    whileHover={{ scale: onClick ? 1.02 : 1 }}
    whileTap={{ scale: onClick ? 0.98 : 1 }}
    onClick={onClick}
    className={clsx(
      'w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring focus-visible:ring-blue-200',
      onClick ? 'cursor-pointer hover:border-blue-200' : 'cursor-default',
    )}
  >
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <div className="mt-1 flex items-center gap-2">
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
      )}
    </div>
    {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
  </motion.button>
);
