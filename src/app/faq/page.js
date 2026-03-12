'use client';

import { motion } from 'framer-motion';
import RulesAndFAQ from '@/app/components/RulesAndFAQ';

export default function FAQPage() {
  return (
    <div className="relative w-full min-h-screen" style={{ background: '#CCFF00' }}>
      {/* Back to Home Button */}
      <div className="relative z-20 pt-6 px-4 md:px-8">
        <motion.a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2 font-bold uppercase text-xs"
          style={{
            fontFamily: 'var(--y2k-font-ui)',
            background: '#FFFFFF',
            color: '#001A6E',
            border: '3px solid #001A6E',
            letterSpacing: '0.08em',
            boxShadow: '3px 3px 0px #001A6E',
          }}
          whileHover={{ x: -2, y: -2, boxShadow: '5px 5px 0px #001A6E' }}
          whileTap={{ x: 1, y: 1, boxShadow: '1px 1px 0px #001A6E' }}
        >
          ← Back to Home
        </motion.a>
      </div>

      {/* FAQ Component */}
      <div className="relative z-10">
        <RulesAndFAQ />
      </div>
    </div>
  );
}
