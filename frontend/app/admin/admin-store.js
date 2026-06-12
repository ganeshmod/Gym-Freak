import { create } from "zustand";

const AdminGlobal = create((set, get) => ({
    CategoryDropdown: [],
    setCategoryDropdown: (val) => set({ CategoryDropdown: val }),

}))

AdminGlobal.subscribe((state) => {
  console.log("CategoryDropdown changed:", state.CategoryDropdown);
});

export default AdminGlobal