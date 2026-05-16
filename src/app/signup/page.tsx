import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-10">
      <AuthForm mode="signup" />
    </main>
  );
}
