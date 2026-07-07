import { FALLBACK_IMAGE } from "../utils";

type FoodCardProps = {
  id: number;
  name: string;
  price: number;
  image?: string | null;
  qty?: number;
  onAdd: (id: number) => void;
  onIncrease?: (id: number) => void;
  onDecrease?: (id: number) => void;
};

export default function FoodCard({
  id,
  name,
  price,
  image,
  qty = 0,
  onAdd,
  onIncrease,
  onDecrease,
}: FoodCardProps) {
  return (
    <div
    
      title={name}
      className="bg-white rounded-xl shadow-sm border flex flex-col overflow-hidden"
    >
      <img
           onClick={() => onAdd(id)}
        src={image || FALLBACK_IMAGE}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
        className="w-full h-32 object-cover rounded-t-xl"
        alt={name}
      />

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold line-clamp-2 break-words">
          {name}
        </h3>

     <div className="flex items-center justify-between mt-auto pt-2 gap-2">
         <span
  className="
    text-green-700
    font-semibold
    text-xs
    sm:text-sm
    whitespace-nowrap
    flex-shrink-0
  "
>
  ₹{price}
</span>

          {qty === 0 ? (
            <button
              onClick={() => onAdd(id)}
              className="bg-[#026388] text-white px-3 py-1 text-xs rounded-lg"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-[#026388] text-white rounded-lg px-2 py-1">
              <button
                onClick={() => onDecrease?.(id)}
                className="font-bold text-lg leading-none"
              >
                -
              </button>

              <span className="min-w-[20px] text-center text-sm font-semibold">
                {qty}
              </span>

              <button
                onClick={() => onIncrease?.(id)}
                className="font-bold text-lg leading-none"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}