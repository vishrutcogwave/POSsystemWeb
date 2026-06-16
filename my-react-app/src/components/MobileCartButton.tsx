import { useState } from "react";
import type { CartItem } from "../utils";
import CartPanel from "./CartPanel";

type MobileCartProps = {
  cart: CartItem[];
  pastItems: CartItem[];
  selectedVoidItems: CartItem[];
  setSelectedVoidItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onVoid: () => void;
  onConvertion: () => void;
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
isFastfood:any
  onUpdateNote: (id: number) => void;
  onKOT: () => void;
  kotLoading: boolean;
  handleGetBill: () => void;
  ncReasons: any[];

  selectedNcCode: number | null;
  setSelectedNcCode: (code: number | null) => void;

  status?: string;
  kotStatus?: string;
  ncRemarks: string;
  setNcRemarks: (text: string) => void;
  instructions: { spid: number; spinfo: string }[]; // ⭐ ADD
  showPast: boolean;
  setShowPast: React.Dispatch<React.SetStateAction<boolean>>;
  openNcModal: boolean;
  setOpenNcModal: React.Dispatch<React.SetStateAction<boolean>>;
};
export const MobileCartButton: React.FC<MobileCartProps> = ({
  openNcModal,
  setOpenNcModal,
  setShowPast,
  isFastfood,
  showPast,
  handleGetBill,
  selectedVoidItems,
  setSelectedVoidItems,
  onVoid,
  status,
  kotStatus,
  cart,
  pastItems,
  ncReasons,
  increaseQty,
  decreaseQty,
  setCart,
  onUpdateNote,
  instructions,
  onKOT,
  kotLoading,
  selectedNcCode,
  setSelectedNcCode,
  ncRemarks,
  setNcRemarks,
  onConvertion,
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
              isFastfood={isFastfood}
                showPast={showPast}
                setShowPast={setShowPast}
                openNcModal={openNcModal}
                setOpenNcModal={setOpenNcModal}
                onConvertion={onConvertion}
                onVoid={onVoid}
                selectedVoidItems={selectedVoidItems}
                setSelectedVoidItems={setSelectedVoidItems}
                instructions={instructions}
                status={status}
                kotStatus={kotStatus}
                ncReasons={ncReasons}
                pastItems={pastItems}
                kotLoading={kotLoading}
                onKOT={onKOT}
                items={cart}
                onIncrease={increaseQty}
                onDecrease={decreaseQty}
                onClear={() => setCart([])}
                onUpdateNote={onUpdateNote}
                selectedNcCode={selectedNcCode}
                setSelectedNcCode={setSelectedNcCode}
                ncRemarks={ncRemarks}
                setNcRemarks={setNcRemarks}
                handleGetBill={handleGetBill}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
