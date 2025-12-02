import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  X,
  ChevronRight,
  School,
  Settings,
} from 'lucide-react';

interface AdminMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AdminMenu({ isOpen, onToggle }: AdminMenuProps) {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin', description: 'Overview and stats' },
    { name: 'Universities', icon: School, path: '/admin/universities', description: 'Manage database' },
    { name: 'Articles', icon: FileText, path: '/admin/articles', description: 'Blog content' },
    { name: 'Users', icon: Users, path: '/admin/users', description: 'User management' },
    { name: 'Settings', icon: Settings, path: '/admin/settings', description: 'System config' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-neutral-900 shadow-2xl z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-80 flex flex-col border-r border-border
        `}
      >
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Admin</h2>
                <p className="text-primary-100 text-sm">Management Panel</p>
              </div>
            </div>
            <button onClick={onToggle} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onToggle}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group
                    ${active
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-2 border-primary-200 dark:border-primary-800'
                      : 'hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 border-2 border-transparent'
                    }
                  `}
                >
                  <div className={`
                    p-2.5 rounded-lg transition-all duration-200
                    ${active ? 'bg-primary-100 dark:bg-primary-800' : 'bg-gray-100 dark:bg-neutral-800 group-hover:bg-gray-200'}
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${active ? 'text-primary-700' : 'text-gray-400'}`} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
