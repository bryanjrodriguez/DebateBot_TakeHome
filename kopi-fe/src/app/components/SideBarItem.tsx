export default function SidebarItem({
    icon: Icon,
    label,
    onClick
  }: {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
  }) {
    return (
      <div
        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer text-sidebar-foreground"
        onClick={onClick}
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
    );
  }
  