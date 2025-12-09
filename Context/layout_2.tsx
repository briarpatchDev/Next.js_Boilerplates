import type { Metadata } from "next";
import "@/app/globals.css";
import { UserProvider } from "@/app/contexts/userContext";

export const metadata: Metadata = {
  title: "Context",
  description: "This is a context Layout",
};

//Retrieves a user from the backend (simulated)
async function getUser() {
  await new Promise((res) => setTimeout(res, 1000));
  let users = [
    {
      id: "1",
      name: "John Doe",
      email: "john@website.com",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.net",
    },
    {
      id: "3",
      name: "Mark Lucas",
      email: "markluke@mysite.com",
    },
    {
      id: "4",
      name: "Lauren Doe",
      email: "laurdoe@website.com",
    },
  ];
  return users[Math.floor(Math.random() * users.length)];
}

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  return (
    <UserProvider user={user}>
      <html lang="en">
        <body>{children}</body>
      </html>
    </UserProvider>
  );
}
