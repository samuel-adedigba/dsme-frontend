import "./globals.css";

export const metadata = {
  title: "DSME Market — Secure Escrow Commerce",
  description: "Buy and sell safely with dual-staking escrow protection.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
