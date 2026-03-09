import { useState } from "react";
import type { CartItem } from "../utils";
import CartPanel from "./CartPanel";

type MobileCartProps = {
  cart: CartItem[];
  pastItems: CartItem[];
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onUpdateNote: (id: number) => void;
  onKOT: () => void;
  kotLoading: boolean;
};
export const MobileCartButton: React.FC<MobileCartProps> = ({
  cart,
  pastItems,
  increaseQty,
  decreaseQty,
  setCart,
  onUpdateNote,
  onKOT,
  kotLoading
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
          <div className="w-80 max-w-full bg-white h-full flex flex-col">

            {/* Close Button */}
            <div className="p-4 border-b">
              <button
                onClick={() => setOpen(false)}
                className="w-full bg-gray-800 text-white py-2 rounded"
              >
                Close
              </button>
            </div>

            {/* Cart Panel */}
            <div className="flex-1 overflow-y-auto">
              <CartPanel
              pastItems={pastItems}
              kotLoading={kotLoading}
              onKOT={onKOT}
                items={cart}
                onIncrease={increaseQty}
                onDecrease={decreaseQty}
                onClear={() => setCart([])}
                onUpdateNote={onUpdateNote}
              />
            </div>

          </div>
        </div>
      )}
    </>
  );
};