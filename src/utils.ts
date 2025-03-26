// Naive hash function to convert string to hex color
// I didn't find real pokermon colors in the API
export const stringToColour = (str: string) => {
  const hash = str.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `#${((hash & 0x00ffffff) << 0).toString(16).padStart(6, "0")}`;
};

export function capitalizeFirstLetter(str: string) {
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}
