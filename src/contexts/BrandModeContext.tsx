import { createContext, useContext, useMemo, type ReactNode } from "react";
import { brandConfig, type BrandMode, type BrandConfig } from "@/config/brandConfig";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface BrandModeContextType {
  brandMode: BrandMode;
  brand: BrandConfig;
}

const BrandModeContext = createContext<BrandModeContextType>({
  brandMode: "campusvoice",
  brand: brandConfig.campusvoice,
});

export function useBrandMode() {
  return useContext(BrandModeContext);
}

function resolveBrandMode(
  tenantType?: string | null,
  industryVertical?: string | null
): BrandMode {
  if (
    tenantType === "enterprise" ||
    tenantType === "franchise" ||
    industryVertical === "manufacturer"
  ) {
    return "fieldmark";
  }
  return "campusvoice";
}

export function BrandModeProvider({ children }: { children: ReactNode }) {
  const { activeWorkspace } = useWorkspace();

  const brandMode = useMemo(
    () =>
      resolveBrandMode(
        activeWorkspace?.tenant_type,
        activeWorkspace?.industry_vertical
      ),
    [activeWorkspace?.tenant_type, activeWorkspace?.industry_vertical]
  );

  const value = useMemo(
    () => ({ brandMode, brand: brandConfig[brandMode] }),
    [brandMode]
  );

  return (
    <BrandModeContext.Provider value={value}>
      {children}
    </BrandModeContext.Provider>
  );
}
