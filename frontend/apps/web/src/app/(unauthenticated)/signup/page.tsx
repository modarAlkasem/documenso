import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { env } from "next-runtime-env";
import SignUpForm from "~/components/forms/SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up",
};

const SignUpPage = () => {
  if (env("NEXT_PUBLIC_DISABLE_SIGNUP") === "true") {
    redirect("/signin");
  }
  return (
    <SignUpForm
      className="w-screen max-w-screen-lg px-4 md:px-16 lg:-my-16"
      isGoogleSSOEnabled={true}
      isOIDCSSOEnabled={true}
    />
  );
};

export default SignUpPage;
