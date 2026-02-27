import { FALLBACK_IMAGE, type Category } from "../utils";

interface CategorySidebarProps {
  active: number;
  onSelect: (id: number) => void;
  categories: Category[];
}

export default function CategorySidebar({
  active,
  onSelect,
  categories,
}: CategorySidebarProps) {
  return (
    <aside
      className="
        w-full lg:w-20 xl:w-64
        bg-[#0B1B34]
        text-white
        p-3
        overflow-x-auto lg:overflow-y-auto
      "
    >
      {/* Container */}
      <div
        className="
          flex lg:flex-col
          gap-3
          whitespace-nowrap
        "
      >
        {categories.map((cat) => {
          const isActive = active === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`
                flex flex-col md:flex-row items-center gap-1 md:gap-3
                p-2 md:p-3
                min-w-[80px] lg:w-full
                rounded-xl transition
                ${isActive
                  ? "bg-[#0576B2] text-white"
                  : "bg-white/5 hover:bg-white/10"}
              `}
            >
              <img
                src={cat.image || FALLBACK_IMAGE}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                className="w-10 h-10 rounded-full object-cover"
                alt={cat.name}
              />

              <span className="text-xs md:text-sm font-semibold text-center md:text-left">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}