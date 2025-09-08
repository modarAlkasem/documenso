"use client";

import { useState, useEffect, useMemo } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { FaIdCardClip } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { match } from "ts-pattern";
import { z } from "zod";

import { AppError, AppErrorCode } from "@documenso/lib/errors/app-error";
import { ErrorCode, isErrorCode } from "@documenso/lib/next-auth/error-codes";
import { trpc } from "@documenso/trpc/react";
import { ZCurrentPasswordSchema } from "@documenso/trpc/server/auth-router/schema";
import { cn } from "@documenso/ui/lib/utils";
import { Button } from "@documenso/ui/primitives/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@documenso/ui/primitives/dialog";
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
  FormMessage,
} from "@documenso/ui/primitives/form/form";
import { Input } from "@documenso/ui/primitives/input";
import { PasswordInput } from "@documenso/ui/primitives/password-input";
import { toast } from "@documenso/ui/primitives/use-toaste";

const ERROR_MESSAGES: Partial<Record<keyof typeof ErrorCode, string>> = {
  [ErrorCode.CREDENTIALS_NOT_FOUND]:
    "The email or password provided is incorrect",
  [ErrorCode.INCORRECT_EMAIL_PASSWORD]:
    "The email or password provided is incorrect",
  [ErrorCode.USER_MISSING_PASSWORD]:
    "This account appears to be using a social login method, please sign in using that method.",
  [ErrorCode.INCORRECT_TWO_FACTOR_CODE]:
    "The two-factor authentication code is incorrect.",
  [ErrorCode.INCORRECT_TWO_FACTOR_BACKUP_CODE]:
    "The backup code provided is incorrect.",
  [ErrorCode.UNVERIFIED_EMAIL]:
    "This account has not been verified. please verify your account before signing in.",
  [ErrorCode.ACCOUNT_DISABLED]:
    "This account has been disabled. Please contact support.",
};

const TwoFactorEnabledErrorCode = ErrorCode.TWO_FACTOR_MISSING_CREDENTIALS;

const LOGIN_REDIRECT_PATH = "/documents";

export const ZSignInFormSchema = z.object({
  email: z.string().email().min(1),
  password: ZCurrentPasswordSchema,
  totpCode: z.string().trim().optional(),
  backupCode: z.string().trim().optional(),
});

export type TSignInFormSchema = z.infer<typeof ZSignInFormSchema>;

export type SignInFormProps = {
  className?: string;
  initialEmail?: string;
  isGoogleSSOEnabled?: boolean;
  isOIDCSSOEnabled?: boolean;
  oidcProviderLabel?: string;
  returnTo?: string;
};

export const SignInForm = ({
  className,
  initialEmail,
  isGoogleSSOEnabled = false,
  isOIDCSSOEnabled = false,
  oidcProviderLabel,
  returnTo,
}: SignInFormProps) => {
  const router = useRouter();

  const isPasskeyEnabled = false;
  const callbackUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return LOGIN_REDIRECT_PATH;
    }

    let url = new URL(returnTo || LOGIN_REDIRECT_PATH, window.location.origin);

    if (url.origin !== window.location.origin) {
      url = new URL(window.location.origin, LOGIN_REDIRECT_PATH);
    }

    return url.toString();
  }, [returnTo]);

  const form = useForm<TSignInFormSchema>({
    values: {
      email: initialEmail ?? "",
      password: "",
      totpCode: "",
      backupCode: "",
    },
    resolver: zodResolver(ZSignInFormSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  const onFormSubmit = async ({
    email,
    password,
    totpCode,
    backupCode,
  }: TSignInFormSchema) => {
    const credentials: Record<string, string> = {
      email,
      password,
    };

    if (totpCode) {
      credentials.totpCode = totpCode;
    }

    if (backupCode) {
      credentials.backupCode = backupCode;
    }
    try {
      const result = await signIn("credentials", {
        ...credentials,
        callbackUrl,
        redirect: false,
      });

      if (result?.error && isErrorCode(result.error)) {
        if (result.error === TwoFactorEnabledErrorCode) {
        }

        const errorMessage = ERROR_MESSAGES[result.error];

        if (result.error === ErrorCode.UNVERIFIED_EMAIL) {
          router.push("/unverified-account");

          toast({
            title: "Unable to sign in",
            description: errorMessage,
          });
          return;
        }

        toast({
          title: "Unable to sign in",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (!result?.url) {
        throw new Error("An unknown error occured");
      }
      router.push(result.url);
    } catch (err) {
      toast({
        title: "An unknown error occured",
        description:
          "We encountered an error while trying to sign you in, please try again later.",
        variant: "destructive",
      });
    }
  };

  const onSignInWithGoogleClick = async () => {
    try {
      await signIn("google", {
        callbackUrl,
      });
    } catch (err) {
      toast({
        title: "An unknown error occured",
        description:
          "We encountered an error while trying to sign you in, please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-y-4 w-full", className)}
        onSubmit={form.handleSubmit(onFormSubmit)}
      >
        <fieldset
          className="flex flex-col gap-y-4 w-full"
          disabled={isSubmitting}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel> Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
                <p className="mt-2 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-muted-foreground text-sm transition hover:opacity-70"
                  >
                    Forgot your password?
                  </Link>
                </p>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="lg"
            loading={isSubmitting}
            className="dark:bg-documenso dark:hover:opacity-90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </fieldset>
        {(isGoogleSSOEnabled || isOIDCSSOEnabled || isPasskeyEnabled) && (
          <div className="relative  flex items-center justify-center gap-x-4 py-2 uppercase text-xs">
            <div className="bg-border flex-1 h-px" />
            <span className="text-muted-foreground bg-transparent">
              Or continue with
            </span>
            <div className="bg-border flex-1 h-px" />
          </div>
        )}
        {isGoogleSSOEnabled && (
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="bg-background text-muted-foreground border"
            disabled={isSubmitting}
            onClick={onSignInWithGoogleClick}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Google
          </Button>
        )}
      </form>
    </Form>
  );
};
