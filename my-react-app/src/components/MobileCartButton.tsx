import { useState } from "react";
import type { CartItem } from "../utils";
import CartPanel from "./CartPanel";

type MobileCartProps = {
  cart: CartItem[];
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
};

export const MobileCartButton: React.FC<MobileCartProps> = ({
  cart,
  increaseQty,
  decreaseQty,
  setCart,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-full shadow-lg z-40"
      >
        Cart ({cart.length})
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-80 max-w-full bg-white h-full p-4 overflow-y-auto">
             <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full bg-gray-800 text-white py-2 rounded"
            >
              Close
            </button>

            <CartPanel
              items={cart}
              onIncrease={increaseQty}
              onDecrease={decreaseQty}
              onClear={() => setCart([])}
            />
           
          </div>
        </div>
      )}
    </>
  );
};