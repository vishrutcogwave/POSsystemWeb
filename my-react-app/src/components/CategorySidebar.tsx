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
    <aside className="
  w-20 md:w-64
  bg-[#0B1B34]
  text-white
  flex flex-col
  p-3
  overflow-y-auto
  h-full
">
    

      {/* Category buttons */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`
                flex flex-col md:flex-row items-center gap-1 md:gap-3
                p-2 md:p-3 w-full rounded-xl transition
                ${isActive ? "bg-[#0576B2] text-white" : "bg-white/5 hover:bg-white/10"}
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