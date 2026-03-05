import React, { useState, useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  existingNote?: string;
};

const dummyInstructions = [
  "Less spicy",
  "Extra spicy",
  "No onion",
  "No garlic",
  "Extra cheese",
  "Less oil",
];

const InstructionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  existingNote,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (existingNote) {
      const parts = existingNote.split(",").map((p) => p.trim());

      const predefined = parts.filter((p) => dummyInstructions.includes(p));
      const customText = parts.filter((p) => !dummyInstructions.includes(p));

      setSelected(predefined);
      setCustom(customText.join(", "));
    } else {
      setSelected([]);
      setCustom("");
    }
  }, [isOpen, existingNote]);

  const toggleInstruction = (value: string) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const handleSave = () => {
    const note = [...selected, custom].filter(Boolean).join(", ");
    onSave(note);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-5 space-y-4">
        <h2 className="font-semibold text-lg">Special Instructions</h2>

        {/* Quick options */}
        <div className="grid grid-cols-2 gap-2">
          {dummyInstructions.map((inst) => (
            <button
              key={inst}
              onClick={() => toggleInstruction(inst)}
              className={`border rounded-lg p-2 text-sm ${
                selected.includes(inst)
                  ? "bg-blue-600 text-white"
                  : "border-gray-300"
              }`}
            >
              {inst}
            </button>
          ))}
        </div>

        {/* Custom instruction */}
        <input
          type="text"
          placeholder="Other instructions..."
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        {/* Actions */}
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
