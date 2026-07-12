import { GoogleAuthPage } from "@/components/auth/GoogleAuthPage";

type RegisterPageProps = {
  searchParams?: Promise<{
    warning?: string | string[];
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;
  const warning = Array.isArray(params?.warning)
    ? params.warning[0]
    : params?.warning;

  return (
    <GoogleAuthPage mode="register" warning={warning} />
  );
}
