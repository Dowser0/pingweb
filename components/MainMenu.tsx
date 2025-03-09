'use client';

import { motion } from 'framer-motion';
import {
  UserIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  Square3Stack3DIcon,
} from '@heroicons/react/24/outline';

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}

const MenuItem = ({ icon, text, onClick }: MenuItemProps) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex w-full items-center gap-3 rounded-lg bg-white/10 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-white/20"
    onClick={onClick}
  >
    <div className="h-6 w-6">{icon}</div>
    {text}
  </motion.button>
);

export default function MainMenu() {
  const menuItems = [
    { icon: <UserIcon />, text: 'Single Player', action: () => console.log('Single Player') },
    { icon: <UsersIcon />, text: 'Multiplayer', action: () => console.log('Multiplayer') },
    { icon: <WrenchScrewdriverIcon />, text: 'Personalizada', action: () => console.log('Personalizada') },
    { icon: <Cog6ToothIcon />, text: 'Configurações', action: () => console.log('Configurações') },
    { icon: <ShoppingBagIcon />, text: 'Loja', action: () => console.log('Loja') },
    { icon: <Square3Stack3DIcon />, text: 'Barras', action: () => console.log('Barras') },
  ];

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {menuItems.map((item, index) => (
        <motion.div
          key={item.text}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <MenuItem
            icon={item.icon}
            text={item.text}
            onClick={item.action}
          />
        </motion.div>
      ))}
    </div>
  );
} 