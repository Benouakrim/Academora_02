import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, GitCompare, BookOpen,
  User, Menu, X, ChevronRight, LogOut
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';

interface UserMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function UserMenu({ isOpen, onToggle }: UserMenuProps) {
  const location = useLocation();
  const { signOut } = useClerk();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, desc: 'Your activity' },
    { name: 'Profile', path: '/dashboard/profile', icon: User, desc: 'Edit preferences' },
    { name: 'Saved List', path: '/dashboard/saved', icon: BookOpen, desc: 'Your universities' },
    { name: 'Compare', path: '/compare', icon: GitCompare, desc: 'Side-by-side view' },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onToggle} />
      )}

      <div className={`
        fixed top-0 left-0 h-full bg-white dark:bg-neutral-900 shadow-2xl z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-80 flex flex-col border-r border-border
      `}>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Menu className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Student Menu</h2>
                <p className="text-indigo-100 text-sm">Your Workspace</p>
              </div>
            </div>
            <button onClick={onToggle} className="p-2 hover:bg-white/20 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onToggle}
                className={`
                  flex items-center gap-4 p-4 rounded-xl transition-all group
                  ${active 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-200' 
                    : 'hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 border-2 border-transparent'}
                `}
              >
                <div className={`p-2.5 rounded-lg ${active ? 'bg-indigo-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
            );
          })}
          
          <div className="mt-auto pt-4 border-t border-border">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 w-full transition-colors"
            >
              <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-neutral-800 group-hover:bg-red-100">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
