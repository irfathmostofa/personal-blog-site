"use client";

import { useFormStatus } from "react-dom";
import { LogOutIcon } from "lucide-react";

import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  className,
  label = "Sign out",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <form action={signOut}>
      <Submit className={className} label={label} />
    </form>
  );
}

function Submit({ className, label }: { className?: string; label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      disabled={pending}
      className={className}
    >
      <LogOutIcon className="size-4" aria-hidden />
      {pending ? "Signing out…" : label}
    </Button>
  );
}
