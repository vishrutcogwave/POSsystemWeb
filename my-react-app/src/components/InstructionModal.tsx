import React, { useState, useEffect } from "react";

type Instruction = {
  spid: number;
  spinfo: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (spcodes: string, note: string) => void;
  existingNote?: string;
    existingSpcodes?: string;   // ⭐ ADD THIS
  instructions: Instruction[]; // 👈 API instructions
};

const InstructionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  existingNote,
  instructions,
  existingSpcodes
}) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [custom, setCustom] = useState("");
  const [search, setSearch] = useState("");

  /* ---------- PREFILL EXISTING NOTE ---------- */
useEffect(() => {
  if (!isOpen) return;

  if (existingSpcodes) {
    const ids = existingSpcodes
      .split(",")
      .map((id) => Number(id))
      .filter(Boolean);

    setSelected(ids);
  } else {
    setSelected([]);
  }

  setCustom(existingNote || "");
}, [isOpen, existingSpcodes, existingNote]);

  /* ---------- FILTER SEARCH ---------- */
  const filteredInstructions = instructions.filter((inst) =>
    inst.spinfo.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------- TOGGLE SELECT ---------- */
  const toggleInstruction = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((v) => v !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  /* ---------- SAVE ---------- */
 const handleSave = () => {
  let values = [...selected.map(String)];

  if (custom.trim() !== "") {
    values.push(custom.trim());
  }

  const spcodeString = values.join(","); // "155,189,test"

  onSave(spcodeString, custom);
};
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-5 space-y-4">

        <h2 className="font-semibold text-lg">Special Instructions</h2>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search instructions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        {/* INSTRUCTIONS */}
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
          {filteredInstructions.map((inst) => (
            <button
              key={inst.spid}
              onClick={() => toggleInstruction(inst.spid)}
              className={`border rounded-lg p-2 text-sm ${
                selected.includes(inst.spid)
                  ? "bg-blue-600 text-white"
                  : "border-gray-300"
              }`}
            >
              {inst.spinfo}
            </button>
          ))}
        </div>

        {/* CUSTOM NOTE */}
        <input
          type="text"
          placeholder="Other instructions..."
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        {/* BUTTONS */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-500 text-sm">
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default InstructionModal;