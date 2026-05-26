import { RegisterClient } from "@/components/auth/register-client";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string | string[] }>;
}) {
  const params = await searchParams;
  const inviteCode = Array.isArray(params.invite) ? params.invite[0] : params.invite;

  return <RegisterClient inviteCode={inviteCode ?? null} />;
}
