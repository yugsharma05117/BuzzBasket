/**
 * Dashboard Sidebar Component
 * Reusable sidebar navigation for Vendor & Admin dashboards
 */
import { useState } from 'react';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

const DashboardSidebar = ({ items, activeItem, onItemClick, title, titleEmoji }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside style={{
      width: collapsed ? '70px' : '260px',
      minHeight: 'calc(100vh - 70px)',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border-light)',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: '70px',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: collapsed ? '20px 12px' : '20px',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.3rem' }}>{titleEmoji}</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1rem',
              whiteSpace: 'nowrap',
            }}>{title}</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            flexShrink: 0,
          }}
        >
          {collapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            title={collapsed ? item.label : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '12px' : '10px 16px',
              marginBottom: '4px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: activeItem === item.id ? 600 : 500,
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: activeItem === item.id
                ? 'linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))'
                : 'transparent',
              color: activeItem === item.id ? 'var(--color-primary-dark)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (activeItem !== item.id) {
                e.target.style.background = 'var(--bg-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeItem !== item.id) {
                e.target.style.background = 'transparent';
              }
            }}
          >
            {activeItem === item.id && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '3px',
                height: '60%',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary)',
              }} />
            )}
            <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            {!collapsed && item.badge && (
              <span style={{
                marginLeft: 'auto',
                background: item.badgeColor || 'var(--color-primary)',
                color: 'white',
                padding: '1px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}>{item.badge}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
