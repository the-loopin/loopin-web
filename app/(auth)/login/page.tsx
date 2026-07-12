import { GoogleAuthPage } from "@/components/auth/GoogleAuthPage";

type LoginPageProps = {
  searchParams?: Promise<{
    warning?: string | string[];
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;
  const warning = Array.isArray(params?.warning)
    ? params.warning[0]
    : params?.warning;

  return (
    <GoogleAuthPage mode="login" warning={warning} />
  );
}
