// utils/sortTamil.js
export const sortTamil = (list, key = "itemname") => {
  return [...list].sort((a, b) =>
    (a[key] || "").localeCompare(b[key] || "", "ta") // "ta" = Tamil locale
  );
};
    