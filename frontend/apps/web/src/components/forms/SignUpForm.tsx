"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { cn } from "@documenso/ui/lib/utils";
import communityCardsImage from "@documenso/assets/images/community-cards.png";
import { motion, AnimatePresence } from "framer-motion";
import UserProfileTimur from "../UserProfileTimur";
import { UserProfileSkeleton } from "../user-profile-skeleton";
import { z } from "zod";
import { ZPasswordSchema } from "@documenso/trpc/server/auth-router/schema";
import { AppError, AppErrorCode } from "@documenso/lib/errors/app-error";
import { NEXT_PUBLIC_WEBAPP_URL } from "@documenso/lib/constants/app";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@documenso/ui/primitives/form/form";
import { Input } from "@documenso/ui/primitives/input";
import { PasswordInput } from "@documenso/ui/primitives/password-input";
import { SignaturePad } from "@documenso/ui/primitives/signature-pad/signature-pad";
import { Button } from "@documenso/ui/primitives/button";
import { FcGoogle } from "react-icons/fc";
import { FaIdCardClip } from "react-icons/fa6";
import { useToast } from "@documenso/ui/primitives/use-toaste";
import { trpc } from "@documenso/trpc/react";
import { signIn } from "next-auth/react";

export type SignUpFormProps = {
  className?: string;
  initialEmail?: string;
  isGoogleSSOEnabled?: boolean;
  isOIDCSSOEnabled?: boolean;
};

type SignUpStepsType = "BASIC_DETAILS" | "CLAIM_USERNAME";

export const ZSignUpFormSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Please enter a valid name" }),
    email: z.string().email(),
    password: ZPasswordSchema,
    signature: z.string().min(1, {
      message: "We need your signature to sign documents",
    }),
    url: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, {
        message: "We need a username to create your profile",
      })
      .regex(/^[a-z0-9-]+$/, {
        message: "Username can only contain alphanumeric characters and dashes",
      }),
  })
  .refine(
    (data) => {
      const { name, email, password } = data;
      return (
        !String(password).includes(String(name)) &&
        !String(password).includes(String(email).split("@")[0])
      );
    },
    {
      message: "Password should not be common or based on personal information",
      path: ["password"],
    }
  );

export const signupErrorMessages: Record<string, string> = {
  SIGNUP_DISABLED: "Signups are disabled",
  [AppErrorCode.ALREADY_EXISTS]:
    "User with this email already exists. please user a different email address.",
  [AppErrorCode.INVALID_REQUEST]:
    "We are unable to create your account. Please review the information you provided then try again.",
  [AppErrorCode.PROFILE_URL_TAKEN]: "This username has already been taken.",
  [AppErrorCode.PREMIUM_PROFILE_URL]:
    "Only Subscribers can have username shorter than 6 characters",
};

export type TSignUpFormSchema = z.infer<typeof ZSignUpFormSchema>;
const SIGN_UP_REDIRECT_PATH = "/documents";
const SignUpForm = ({
  className,
  initialEmail,
  isGoogleSSOEnabled,
  isOIDCSSOEnabled,
}: SignUpFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<SignUpStepsType>("BASIC_DETAILS");
  const utmSrc = searchParams?.get("utm_source");
  const baseUrl = new URL(NEXT_PUBLIC_WEBAPP_URL() ?? "http://localhost:3000");
  const { toast } = useToast();
  const form = useForm<TSignUpFormSchema>({
    values: {
      name: "",
      email: initialEmail ?? "",
      password: "",
      signature: "",
      url: "",
    },
    mode: "onBlur",
    resolver: zodResolver(ZSignUpFormSchema),
  });
  const isSubmitting = form.formState.isSubmitting;
  const [name, url] = form.watch(["name", "url"]);

  const { mutateAsync: signup } = trpc.auth.signup.useMutation();
  const onFormSubmit = async ({
    name,
    email,
    password,
    signature,
    url,
  }: TSignUpFormSchema) => {
    try {
      await signup({ name, email, password, signature, url });
      router.push("/unverified-account");
      toast({
        title: "Registeration Successful",
        description:
          "You have successfully registered. Please verify your account by clicking on the link you received in the email.",
        duration: 5000,
      });
    } catch (err) {
      const error = AppError.parseError(err);
      const errorMessage =
        signupErrorMessages[error.code] ?? signupErrorMessages.INVALID_REQUEST;
      if (
        error.code === AppErrorCode.PROFILE_URL_TAKEN ||
        error.code === AppErrorCode.PREMIUM_PROFILE_URL
      ) {
        form.setError("url", {
          message: errorMessage,
        });
      } else {
        toast({
          title: "An error occured",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };
  const onNextClick = async () => {
    let isValid = await form.trigger([
      "name",
      "email",
      "password",
      "signature",
    ]);

    if (isValid) setStep("CLAIM_USERNAME");
  };

  const onSignUpWithGoogleClick = async () => {
    try {
      await signIn("google", {
        callbackUrl: SIGN_UP_REDIRECT_PATH,
      });
    } catch (err) {
      toast({
        title: "An unknown error occured",
        description:
          "We encountred an unknown error while trying to sign you up. Please try again later.",
        variant: "destructive",
      });
    }
  };
  return (
    <div className={cn("flex justify-center gap-x-12", className)}>
      <div className=" hidden relative flex-1 overflow-hidden rounded-xl border xl:flex">
        <div className="absolute -inset-8 -z-[2] backdrop-blur">
          <Image
            src={communityCardsImage}
            fill={true}
            alt="community-cards"
            className="dark:brightness-95 dark:contrast-[70%]"
          />
        </div>
        <div className="bg-background/50 absolute -inset-8 -z-[1] backdrop-blur-[2px]" />
        <div className="relative flex h-full w-full flex-col items-center justify-evenly">
          <div className="bg-background rounded-2xl border px-4 py-1 text-sm font-medium">
            User Profiles are here!
          </div>
          <AnimatePresence>
            {step === "BASIC_DETAILS" ? (
              <motion.div className="w-full max-w-md" layoutId="user-profile">
                <UserProfileTimur className="bg-background border-border rounded-2xl border shadow-md" />
              </motion.div>
            ) : (
              <motion.div layoutId="user-profile" className="w-full max-w-md">
                {" "}
                <UserProfileSkeleton
                  user={{ name, url }}
                  className="bg-background border-border rounded-2xl border shadow-md"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div />
        </div>
      </div>
      <div className="border-border dark:bg-background relative z-10 flex min-h-[min(850px,80vh)] w-full max-w-lg flex-col rounded-xl border bg-netural-100 p-6">
        {step === "BASIC_DETAILS" && (
          <div className="h-20">
            <h1 className="text-xl font-semibold md:text-2xl">
              Create a new account
            </h1>
            <p className="text-muted-foreground mt-2 text-xs md:text-sm ">
              {" "}
              Create your account and start using state-of-the-art document
              signing. Open and beautiful signing is within your grasp.
            </p>
          </div>
        )}
        {step === "CLAIM_USERNAME" && (
          <div className="h-20">
            <h1 className="text-xl font-semibold md:text-2xl">
              Claim your username now
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-2">
              {" "}
              You will get notified & be able to set up your documenso public
              profile when we launch the feature
            </p>
          </div>
        )}
        <hr className="-mx-6 my-4" />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="flex w-full flex-1 flex-col gap-y-4"
          >
            {step == "BASIC_DETAILS" && (
              <fieldset
                className={cn(
                  "flex h-[550px] w-full flex-col gap-y-4",
                  (isGoogleSSOEnabled || isOIDCSSOEnabled) && "h-[650px]"
                )}
                disabled={isSubmitting}
              >
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Adress</FormLabel>
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="signature"
                  control={form.control}
                  render={({ field: { onChange } }) => (
                    <FormItem>
                      <FormLabel> Sign Here</FormLabel>
                      <FormControl>
                        <SignaturePad
                          className="h-36 w-full"
                          containerClassName="mt-2 rounded-lg border bg-background"
                          onChange={(v) => onChange(v ?? "")}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {(isGoogleSSOEnabled || isOIDCSSOEnabled) && (
                  <>
                    <div className="relative flex items-center justify-center gap-x-4 py-2 text-xs uppercase">
                      <div className="bg-border h-px flex-1" />
                      <span className="text-muted-foreground bg-transparent">
                        Or
                      </span>
                      <div className="bg-border flex-1 h-px" />
                    </div>
                  </>
                )}
                {isGoogleSSOEnabled && (
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="bg-background text-muted-foreground"
                    disabled={isSubmitting}
                    onClick={onSignUpWithGoogleClick}
                  >
                    <FcGoogle className="h-5 w-5 mr-2" />
                    Sign Up with Google
                  </Button>
                )}
                {isOIDCSSOEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="bg-background text-muted-foreground"
                    disabled={isSubmitting}
                  >
                    <FaIdCardClip className="h-5 w-5 mr-2" />
                    Sign Up with OIDC
                  </Button>
                )}
                <p className="text-muted-foreground mt-4 text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="text-documenso-700 duration-200 hover:opacity-50"
                  >
                    Sign in instead
                  </Link>
                </p>
              </fieldset>
            )}
            {step == "CLAIM_USERNAME" && (
              <fieldset
                className={cn(
                  "flex flex-col h-[550px] gap-y-4",
                  (isGoogleSSOEnabled || isOIDCSSOEnabled) && "h-[650px]"
                )}
                disabled={isSubmitting}
              >
                <FormField
                  name="url"
                  control={form.control}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Public Profile username</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            className="my-2 lowercase"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <div className="bg-muted/50 inline-block text-sm border-border rounded-md px-2 py-1 text-muted-foreground mt-2 truncate max-[16rem] lowercase">
                          {" "}
                          {baseUrl.host}/u/{field.value || "<username>"}
                        </div>
                      </FormItem>
                    );
                  }}
                />
              </fieldset>
            )}
            {step === "BASIC_DETAILS" && (
              <div className="mt-6">
                <p className="text-muted-foreground text-sm">
                  <span className="font-medium mr-1"> Basic Details</span>
                  1/2
                </p>
              </div>
            )}
            {step === "CLAIM_USERNAME" && (
              <div className="mt-6">
                <p className="text-muted-foreground text-sm">
                  <span className="font-medium mr-1"> Claim username</span>
                  1/2
                </p>
              </div>
            )}
            <div className="bg-foreground/40 mt-4 h-1.5 relative">
              <motion.div
                layout="size"
                className="bg-documenso absolute inset-y-0  rounded-full"
                style={{ width: step === "BASIC_DETAILS" ? "50%" : "100%" }}
              />
            </div>
            <div className="flex items-center gap-x-4">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                className="flex-1 disabled:cursor-not-allowed"
                disabled={step === "BASIC_DETAILS" || isSubmitting}
                onClick={() => setStep("BASIC_DETAILS")}
              >
                Back
              </Button>
              {step == "BASIC_DETAILS" && (
                <Button
                  type="button"
                  size="lg"
                  className="flex-1 disabled:cursor-not-allowed"
                  loading={isSubmitting}
                  onClick={onNextClick}
                >
                  Next
                </Button>
              )}
              {step == "CLAIM_USERNAME" && (
                <Button
                  size="lg"
                  className="flex-1 disabled:cursor-not-allowed"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Complete
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignUpForm;
