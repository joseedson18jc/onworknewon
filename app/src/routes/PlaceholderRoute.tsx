import * as React from 'react';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export interface PlaceholderRouteProps {
  title: string;
  description: string;
  roadmap?: string[];
}

export const PlaceholderRoute: React.FC<PlaceholderRouteProps> = ({ title, description, roadmap = [] }) => (
  <div className="max-w-[1440px] mx-auto px-6 py-10">
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden bg-mesh bg-noise p-10 border-accent/25">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center">
            <Construction className="w-5 h-5 text-accent" />
          </div>
          <Badge variant="accent">Migration Wave 3</Badge>
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">{title}</h1>
        <p className="text-text-muted max-w-[60ch] mb-6">{description}</p>
        {roadmap.length > 0 && (
          <ul className="flex flex-col gap-2 max-w-[60ch]">
            {roadmap.map((r) => (
              <li key={r} className="flex items-start gap-2 text-sm text-text">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </motion.div>
  </div>
);
