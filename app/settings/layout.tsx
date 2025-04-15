import { AuthProvider } from "@/components/auth-provider";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
