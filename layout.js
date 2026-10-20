export const metadata = {
  title: "Seth",
  description: "A voice assistant you talk to.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
