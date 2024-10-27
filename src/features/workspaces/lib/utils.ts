export function generateJoinCode() {
  const code = Array.from(
    { length: 6 },
    () => "0123456789abcdefghijklmnopqrstuvwyxz"[Math.floor(Math.random() * 36)]
  ).join("");
  return code
}
