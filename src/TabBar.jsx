import AppIcon from './icons.jsx'

// The 5 spaces of the hub, like the tab bar in Apple's Clock app.
const TABS = [
  { id: 'training', label: 'Training', href: '#training' },
  { id: 'work', label: 'Work', href: '#work' },
  { id: 'cookbook', label: 'Cookbook', href: '#cookbook' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'ideas', label: 'Ideas', href: '#ideas' },
]

// The bar at the bottom of every screen. The open tab is orange, the rest
// grey. On hidden pages (Settings, History, …) no tab is highlighted.
function TabBar({ active }) {
  return (
    <nav className="tab-bar" aria-label="Spaces">
      {TABS.map(tab => (
        <a
          key={tab.id}
          href={tab.href}
          className={tab.id === active ? 'tab-bar-link active' : 'tab-bar-link'}
          aria-current={tab.id === active ? 'page' : undefined}
        >
          <AppIcon name={tab.id} size={26} />
          <span>{tab.label}</span>
        </a>
      ))}
    </nav>
  )
}

export default TabBar
