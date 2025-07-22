"use client";

import React, { createContext, useContext } from "react";

type BrandingContextValue = {
  brandingEnabled: boolean;
  brandingUrl: string;
  brandingLogo: string;
  brandingCompanyDetails: string;
  brandingHidePoweredBy: boolean;
};

const BrandingContext = createContext<BrandingContextValue | undefined>(
  undefined
);

const defaultBrandingContextValue: BrandingContextValue = {
  brandingEnabled: false,
  brandingUrl: "",
  brandingLogo: "",
  brandingCompanyDetails: "",
  brandingHidePoweredBy: false,
};

export const BrandingProvider = (props: {
  children: React.ReactNode;
  branding?: BrandingContextValue | undefined;
}) => {
  <BrandingContext value={props.branding ?? defaultBrandingContextValue}>
    {props.children}
  </BrandingContext>;
};

export const useBranding = () => {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    throw new Error("Branding context not found");
  }

  return ctx;
};

export type BrandingSettings = BrandingContextValue;
