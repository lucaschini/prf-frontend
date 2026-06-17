const TABS = [
  { id: "grafo", label: "Grafo" },
  { id: "dash", label: "Dashboard" },
  { id: "rankings", label: "Rankings" },
];

export function TabBar({ active, onChange }) {
  return (
    <div
      className="bg-white border-b border-gray-200 px-4 flex-shrink-0"
      role="navigation"
    >
      <div className="flex gap-0" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => onChange(tab.id)}
            className={[
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              active === tab.id
                ? "text-gov-blue border-gov-blue font-semibold"
                : "text-gray-500 border-transparent hover:text-gov-blue hover:border-gov-blue-light",
            ].join(" ")}
          >
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
