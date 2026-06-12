import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CategoryModal({
  open,
  mode = "category",
  categories = [],
  selectedParentId = "",
  onChangeParent,
  onClose,
  onSave,
  saving = false,
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open, mode]);

  const title = useMemo(
    () => (mode === "subcategory" ? "Add Subcategory" : "Add Category"),
    [mode]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>

        <div className="space-y-4">
          {mode === "subcategory" && (
            <div className="flex flex-col">
              <Label className="mb-1">Parent Category</Label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={selectedParentId || ""}
                onChange={(e) => onChangeParent?.(e.target.value)}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c._id || c.value} value={c._id || c.value}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Label className="mb-1">
              {mode === "subcategory" ? "Subcategory Name" : "Category Name"}
            </Label>
            <Input
              placeholder={
                mode === "subcategory" ? "e.g. Dumbbells" : "e.g. Equipment"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() =>
                onSave?.(
                  mode === "subcategory"
                    ? { name: name.trim(), parentId: selectedParentId }
                    : { name: name.trim() }
                )
              }
              disabled={
                saving ||
                !name.trim() ||
                (mode === "subcategory" && !selectedParentId)
              }
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
