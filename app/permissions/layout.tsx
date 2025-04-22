import { AuthProvider } from "@/components/auth-provider";

export default function PermissionsLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
