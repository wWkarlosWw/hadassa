import { getCurrentUser } from "@/modules/auth/session";
import { getSection } from "@/modules/cms/service";
import { getMenu } from "@/modules/menu/service";
import { HeaderClient } from "./header-client";

export async function Header() {
  const [user, site, links] = await Promise.all([getCurrentUser(), getSection("site"), getMenu("HEADER")]);
  return (
    <HeaderClient
      user={user ? { name: user.fullName.split(" ")[0] } : null}
      links={links}
      brand={{
        siteName: site.siteName,
        eyebrow: site.brandEyebrow,
        script: site.brandScript,
        logoUrl: site.logoUrl || "/brand/logo.webp",
        mobileImageUrl: site.mobileMenuImageUrl,
      }}
      labels={{
        donate: site.donateLabel,
        donateMobile: site.donateMobileLabel,
        login: site.loginLabel,
        loginMobile: site.loginMobileLabel,
        panel: site.panelLabel,
      }}
      announcement={site.announcementEnabled && Boolean(site.announcementText)}
    />
  );
}
