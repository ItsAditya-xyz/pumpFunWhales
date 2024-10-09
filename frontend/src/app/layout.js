import "./globals.css";
export const metadata = {
  title: "PumpFunWhales",
  description: "Monitor what whales are buying on pump.fun",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
