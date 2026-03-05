import { FALLBACK_IMAGE } from "../utils";

type FoodCardProps = {
  id: number;
  name: string;
  price: number;
  image?: string | null;
  onAdd: (id: number) => void;
};

export default function FoodCard({ id, name, price, image, onAdd }: FoodCardProps) {
  return (
    <div   onClick={() => onAdd(id)} title={name} className="bg-white rounded-xl shadow-sm border">
      <img
        src={image || FALLBACK_IMAGE}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
        className="w-full h-32 object-cover rounded-t-xl"
        alt={name}
      />

      <div className="p-3">
        <h3  className="text-sm font-semibold truncate">{name}</h3>

        <div className="flex justify-between items-center mt-2">
          <span className="text-green-700 font-bold text-sm">
            ₹ {price.toFixed(2)}
          </span>

          <button
          
            className="bg-[#026388] text-white px-3 py-1 text-xs rounded-lg"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}