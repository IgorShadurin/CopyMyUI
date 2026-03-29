import type { Page } from "@playwright/test";

import { expect, test } from "./fixture";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVx0AAAAASUVORK5CYII=",
  "base64"
);

const createdTimestamp = Date.now();
const createdTitle = `E2E Prism Metrics Deck ${createdTimestamp}`;
const createdSlug = slugify(createdTitle);
const updatedHarborSummary =
  "A moderator-approved dashboard refresh with cleaner KPI grouping and a brighter hero lane.";
const harborPublicSummary =
  "A modular dashboard header with KPI strips, trend pills, and callout cards.";
const updatedNavigationDescription =
  "Navigation systems with bright hierarchy, platform polish, and reusable routing shells.";

test("users can switch locales and keep localized routes", async ({ page }) => {
  await page.goto("/");

  await page.waitForURL("**/en");
  await expect(page.getByTestId("browse-rail")).toBeVisible();
  await expect(page.getByTestId("browse-category-link-desktop-navigation")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Build your SwiftUI component library.",
    })
  ).toBeVisible();

  await page.locator('[data-testid="locale-switcher-trigger"]:visible').click();
  await page.getByTestId("locale-option-es").click();
  await page.waitForURL("**/es");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Crea tu biblioteca de componentes SwiftUI.",
    })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Explorar", exact: true })).toBeVisible();

  await page.goto("/components");
  await page.waitForURL("**/es/components");
  await expect(page.getByTestId("browse-rail")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Componentes SwiftUI públicos" })
  ).toBeVisible();
});

test("browse pages keep the category rail visible on desktop", async ({ page }) => {
  await page.goto("/en/components");
  await expect(page.getByTestId("browse-rail")).toBeVisible();
  await expect(page.getByTestId("browse-category-link-desktop-navigation")).toBeVisible();

  await page.goto("/en/categories/navigation");
  await expect(page.getByTestId("browse-rail")).toBeVisible();
  await expect(page.getByTestId("browse-category-link-desktop-navigation")).toHaveAttribute(
    "data-active",
    "true"
  );
});

test("paywall is a normal category with mixed free and premium components", async ({ page }) => {
  await page.goto("/en/categories/commerce");
  await expect(page.getByTestId("category-paywall-section")).toHaveCount(0);

  await page.goto("/en/categories/paywall");
  await expect(page.getByRole("heading", { level: 1, name: "Paywall" })).toBeVisible();
  await expect(page.getByText("Harbor Metrics Deck").first()).toBeVisible();
  await expect(page.getByText("Atlas Sidebar Flow").first()).toBeVisible();
  await expect(page.getByTestId("category-paywall-section")).toHaveCount(0);
});

test("signed-in users can favorite and share approved components", async ({ page }) => {
  await signInAs(page, "creator@copymyui.dev", "/en/components/coda-onboarding-flow");

  await expect(
    page.getByRole("heading", { level: 1, name: "Coda Onboarding Flow" })
  ).toBeVisible();

  const shareLink = page.getByRole("link", { name: "Share on X" });
  const shareHref = await shareLink.getAttribute("href");
  const shareUrl = new URL(shareHref ?? "");
  const sharedComponentUrl = new URL(shareUrl.searchParams.get("url") ?? "");

  expect(sharedComponentUrl.origin).toBe(new URL(page.url()).origin);
  expect(sharedComponentUrl.pathname).toBe("/en/components/coda-onboarding-flow");

  await page.getByTestId("favorite-button").click();
  await expect(page.getByTestId("favorite-button")).toHaveAttribute(
    "aria-label",
    "Remove from favorites"
  );

  await page.goto("/en/favorites");
  await expect(page.getByRole("heading", { level: 1, name: "Your favorites" })).toBeVisible();
  await expect(page.getByText("Coda Onboarding Flow")).toBeVisible();
});

test("new components stay private until approval", async ({ page }) => {
  await signInAs(page, "creator@copymyui.dev", "/en/dashboard/components/new");

  await fillComponentForm(page, {
    title: createdTitle,
    category: "Dashboards",
    summary:
      "A bright analytics surface with split metrics, editorial spacing, and reusable SwiftUI cards.",
    description:
      "This end-to-end test component verifies that new submissions stay private until a moderator approves them, even though the creator can still access the draft privately.",
    changelog: "Initial pending review version from the Playwright suite.",
  });

  await page.getByRole("button", { name: "Save draft" }).click();
  await page.waitForURL(/\/dashboard\/components\/[^/]+\/edit\?saved=1/);
  await page.locator('input[name="accessType"]').evaluate((input) => {
    (input as HTMLInputElement).value = "PREMIUM";
  });
  await page.locator('input[name="sellerTargetPriceUsd"]').evaluate((input) => {
    (input as HTMLInputElement).value = "100";
  });
  await page.getByRole("button", { name: "Submit for review" }).click();
  await page.waitForURL(/\/dashboard(?:\?submitted=1)?$/);
  await expect(page.getByTestId(`dashboard-component-${createdSlug}`)).toContainText(createdTitle);

  await signOut(page);

  const response = await page.goto(`/en/components/${createdSlug}`);
  expect(response?.status()).toBe(404);
  await expect(page.getByText("This page could not be found")).toBeVisible();

  await signInAs(page, "moderator@copymyui.dev", "/en/moderation");

  const moderationCard = page.getByTestId(`moderation-component-${createdSlug}`);
  await expect(moderationCard).toContainText(createdTitle);
  await moderationCard.locator("select[name='primaryCategoryId']").selectOption({
    label: "Commerce",
  });
  await moderationCard.locator("label").filter({ hasText: "Forms" }).click();
  await moderationCard.getByPlaceholder("Explain the decision, especially if you are declining the update.").fill(
    "Approved in the Playwright suite."
  );
  acceptNextDialog(page);
  await moderationCard.getByRole("button", { name: "Approve revision" }).click();
  await page.waitForURL("**/moderation?decision=approved");

  await expect(
    page.getByText("Revision approved and pushed to the public gallery.")
  ).toBeVisible();

  await signOut(page);
  await page.goto(`/en/components/${createdSlug}`);

  await expect(page.getByRole("heading", { level: 1, name: createdTitle })).toBeVisible();
  await expect(page.getByText("$135.00", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in to buy" })).toBeVisible();

  await page.goto("/en/categories/commerce");
  await expect(page.getByRole("heading", { level: 1, name: "Commerce" })).toBeVisible();
  await expect(page.getByText(createdTitle).first()).toBeVisible();

  await page.goto("/en/categories/forms");
  await expect(page.getByRole("heading", { level: 1, name: "Forms" })).toBeVisible();
  await expect(page.getByText(createdTitle).first()).toBeVisible();

  await signInAs(page, "fan@copymyui.dev", `/en/components/${createdSlug}`);
  await expect(page.getByRole("button", { name: /Buy now/ })).toBeVisible();
  await page.getByRole("button", { name: /Buy now/ }).click();
  await page.waitForURL(`**/components/${createdSlug}?purchased=1`);

  await expect(
    page.getByText("Premium component unlocked. The SwiftUI source is now available.")
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy code" })).toBeVisible();

  await page.goto("/en/purchases");
  await expect(page.getByRole("heading", { level: 1, name: "Your premium purchases" })).toBeVisible();
  await expect(page.getByText(createdTitle)).toBeVisible();
});

test("moderators must provide a note when declining a revision", async ({ page }) => {
  const declineNote =
    "The pending revision still needs cleaner caption spacing before it can replace the public version.";

  await signInAs(page, "creator@copymyui.dev", "/en/dashboard");
  const harborCard = page.getByTestId("dashboard-component-harbor-metrics-deck");
  await harborCard.getByRole("button", { name: "Start update" }).click();
  await page.waitForURL(/\/dashboard\/components\/.+\/edit/);
  await page.getByLabel("Summary").fill("Pending revision for moderation decline flow.");
  await page.getByLabel("Changelog").fill("Submitted to verify required decline notes.");
  await page.getByRole("button", { name: "Submit for review" }).click();
  await page.waitForURL(/\/dashboard(?:\?submitted=1)?$/);

  await signInAs(page, "moderator@copymyui.dev", "/en/moderation");
  const moderationCard = page.getByTestId("moderation-component-harbor-metrics-deck");
  await expect(moderationCard).toBeVisible();

  acceptNextDialog(page);
  await moderationCard.getByRole("button", { name: "Decline revision" }).click();
  await expect(
    moderationCard.getByText("Declining a component requires a moderator note.")
  ).toBeVisible();

  await moderationCard
    .getByPlaceholder("Explain the decision, especially if you are declining the update.")
    .fill(declineNote);
  acceptNextDialog(page);
  await moderationCard.getByRole("button", { name: "Decline revision" }).click();
  await page.waitForURL("**/moderation?decision=declined");

  await expect(
    page.getByText("Revision declined. The creator can revise and resubmit it.")
  ).toBeVisible();
  await expect(page.getByTestId("moderation-component-harbor-metrics-deck")).toHaveCount(0);

  await signInAs(page, "creator@copymyui.dev", "/en/dashboard");
  await expect(page.getByTestId("dashboard-component-harbor-metrics-deck")).toContainText(
    declineNote
  );
});

test("approved components require re-approval after updates", async ({ page }) => {
  await signInAs(page, "creator@copymyui.dev", "/en/dashboard");

  const harborCard = page.getByTestId("dashboard-component-harbor-metrics-deck");
  await harborCard.getByRole("button", { name: "Start update" }).click();
  await page.waitForURL(/\/dashboard\/components\/.+\/edit/);

  await page.getByLabel("Summary").fill(updatedHarborSummary);
  await page.getByLabel("Changelog").fill("Version 2 adds cleaner grouping and a new highlight rail.");
  await page.getByRole("button", { name: "Submit for review" }).click();
  await page.waitForURL(/\/dashboard(?:\?submitted=1)?$/);
  await expect(page.getByTestId("dashboard-component-harbor-metrics-deck")).toContainText(
    "Pending review"
  );

  await signOut(page);
  await page.goto("/en/components/harbor-metrics-deck");
  await expect(page.getByText(harborPublicSummary)).toBeVisible();
  await expect(page.getByText(updatedHarborSummary)).toHaveCount(0);

  await signInAs(page, "moderator@copymyui.dev", "/en/moderation");

  const moderationCard = page.getByTestId("moderation-component-harbor-metrics-deck");
  acceptNextDialog(page);
  await moderationCard.getByRole("button", { name: "Approve revision" }).click();
  await page.waitForURL("**/moderation?decision=approved");

  await signOut(page);
  await page.goto("/en/components/harbor-metrics-deck");

  await expect(page.getByText(updatedHarborSummary)).toBeVisible();
  await expect(
    page
      .locator("#component-detail-right-column")
      .getByText(/Version 2 · Harbor Metrics Deck/)
      .first()
  ).toBeVisible();
});

test("admin users can change premium markup from the admin panel", async ({ page }) => {
  await signInAs(page, "admin@copymyui.dev", "/en/admin");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Manage premium marketplace settings",
    })
  ).toBeVisible();

  await page.getByLabel("Platform markup percent").fill("50");
  await page.getByRole("button", { name: "Save markup" }).click();
  await page.waitForURL("**/admin?updated=1");

  await expect(page.getByText("Marketplace markup updated.")).toBeVisible();

  await signOut(page);
  await page.goto("/en/components/meridian-pricing-lens");

  await expect(page.getByText("$180.00", { exact: true })).toBeVisible();
});

test("admins can edit categories and public category pages stay available", async ({ page }) => {
  await signInAs(page, "admin@copymyui.dev", "/en/admin");

  const navigationRow = page
    .locator("div.rounded-lg.border.border-black\\/8.bg-white")
    .filter({ has: page.locator("p", { hasText: /^Navigation$/ }) })
    .first();
  await navigationRow.getByRole("link", { name: "Edit" }).click();
  await page.waitForURL(/\/admin\?categoryId=/);

  const navigationForm = page
    .locator("form")
    .filter({ has: page.locator('input[name="categoryId"]') })
    .first();

  await navigationForm.locator('textarea[name="description"]').fill(updatedNavigationDescription);
  await navigationForm.getByRole("button", { name: "Save category" }).click();
  await page.waitForURL("**/admin?updated=category");
  await expect(page.getByText("Category settings updated.")).toBeVisible();

  await signOut(page);
  await page.goto("/en/categories/navigation");
  await expect(page.getByRole("heading", { level: 1, name: "Navigation" })).toBeVisible();
  await expect(page.getByText(updatedNavigationDescription).first()).toBeVisible();
});

test("users can manage API keys and call the protected API", async ({ page, request }) => {
  await signInAs(page, "fan@copymyui.dev", "/en/dashboard/api-keys");

  const createForm = page.getByTestId("api-key-create-form");
  await createForm.getByLabel("Key name").fill("Catalog Bot");
  await createForm.getByRole("button", { name: "Create key" }).click();

  const rawApiKey = (await page.getByTestId("created-api-key").textContent())?.trim();
  expect(rawApiKey).toContain("cmu_");

  const noAuthResponse = await request.get("/api/v1/me");
  expect(noAuthResponse.status()).toBe(401);
  expect((await noAuthResponse.json()).error.code).toBe("missing_api_key");

  const malformedAuthResponse = await request.get("/api/v1/me", {
    headers: {
      Authorization: "Token invalid",
    },
  });
  expect(malformedAuthResponse.status()).toBe(401);
  expect((await malformedAuthResponse.json()).error.code).toBe(
    "invalid_authorization_header"
  );

  const authHeaders = {
    Authorization: `Bearer ${rawApiKey}`,
  };

  const meResponse = await request.get("/api/v1/me", {
    headers: authHeaders,
  });
  expect(meResponse.status()).toBe(200);
  const meJson = await meResponse.json();
  expect(meJson.user.email).toBe("fan@copymyui.dev");
  expect(meJson.permissions.canPurchase).toBe(false);
  expect(meJson.user.favoritesCount).toBeGreaterThan(0);

  const missingQueryResponse = await request.get("/api/v1/search", {
    headers: authHeaders,
  });
  expect(missingQueryResponse.status()).toBe(400);
  expect((await missingQueryResponse.json()).error.code).toBe("missing_query");

  const authorSearchResponse = await request.get(
    "/api/v1/search?q=Demo%20Creator",
    {
      headers: authHeaders,
    }
  );
  expect(authorSearchResponse.status()).toBe(200);
  const authorSearchJson = await authorSearchResponse.json();
  expect(authorSearchJson.results.some((result: { title: string }) => result.title === "Aurora Tab Orbit")).toBe(true);

  await page.goto("/en/components?q=Aurora%20Tab%20Orbit");
  await expect(
    page.getByRole("heading", { level: 1, name: "Public SwiftUI components" })
  ).toBeVisible();
  await expect(
    page.getByTestId("component-card-aurora-tab-orbit").getByText("Aurora Tab Orbit")
  ).toBeVisible();

  await page.goto("/en/components?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E");
  await expect(
    page.getByRole("heading", { level: 1, name: "Public SwiftUI components" })
  ).toBeVisible();

  const spotlightSearchResponse = await request.get(
    "/api/v1/search?q=Frame%20Video%20Spotlight",
    {
      headers: authHeaders,
    }
  );
  const spotlightSearchJson = await spotlightSearchResponse.json();
  const spotlightComponentId = spotlightSearchJson.results[0]?.id;
  expect(spotlightComponentId).toBeTruthy();

  const favoriteResponse = await request.put(
    `/api/v1/favorites/${spotlightComponentId}`,
    {
      headers: authHeaders,
    }
  );
  expect(favoriteResponse.status()).toBe(200);
  expect((await favoriteResponse.json()).isFavorite).toBe(true);

  const favoritesResponse = await request.get("/api/v1/favorites", {
    headers: authHeaders,
  });
  expect(favoritesResponse.status()).toBe(200);
  const favoritesJson = await favoritesResponse.json();
  expect(
    favoritesJson.favorites.some((result: { id: string }) => result.id === spotlightComponentId)
  ).toBe(true);

  const deleteFavoriteResponse = await request.delete(
    `/api/v1/favorites/${spotlightComponentId}`,
    {
      headers: authHeaders,
    }
  );
  expect(deleteFavoriteResponse.status()).toBe(200);
  expect((await deleteFavoriteResponse.json()).isFavorite).toBe(false);

  const premiumSearchResponse = await request.get(
    "/api/v1/search?q=Meridian%20Pricing%20Lens",
    {
      headers: authHeaders,
    }
  );
  const premiumSearchJson = await premiumSearchResponse.json();
  const meridianComponentId = premiumSearchJson.results[0]?.id;
  expect(meridianComponentId).toBeTruthy();

  const blockedPurchaseResponse = await request.post(
    `/api/v1/components/${meridianComponentId}/purchase`,
    {
      headers: authHeaders,
    }
  );
  expect(blockedPurchaseResponse.status()).toBe(403);
  expect((await blockedPurchaseResponse.json()).error.code).toBe("purchase_disabled");

  await page.goto("/en/dashboard/api-keys");
  const apiKeyCard = page.locator("[data-testid^='api-key-card-']").first();
  await apiKeyCard.locator('input[name="name"]').fill("Catalog Bot Updated");
  await apiKeyCard.getByRole("button", { name: "Save key" }).click();
  await expect(page.getByText("API key updated.")).toBeVisible();

  const purchaseStillBlockedResponse = await request.post(
    `/api/v1/components/${meridianComponentId}/purchase`,
    {
      headers: authHeaders,
    }
  );
  expect(purchaseStillBlockedResponse.status()).toBe(403);
  expect((await purchaseStillBlockedResponse.json()).error.code).toBe("purchase_disabled");

  await apiKeyCard.getByRole("button", { name: "Delete key" }).click();
  await expect(page.getByText("API key deleted.")).toBeVisible();

  const deletedKeyResponse = await request.get("/api/v1/me", {
    headers: authHeaders,
  });
  expect(deletedKeyResponse.status()).toBe(401);
  expect((await deletedKeyResponse.json()).error.code).toBe("invalid_api_key");
});

test("public creator profiles are accessible without authentication", async ({ page }) => {
  await page.goto("/en/creators/demo-creator");

  await expect(page.getByRole("heading", { level: 1, name: "Demo Creator" })).toBeVisible();
  await expect(page.getByText("Approved free releases")).toBeVisible();
  await expect(page.getByText("Approved premium releases")).toBeVisible();
  await expect(page.getByText("Aurora Tab Orbit")).toBeVisible();
  await expect(page.getByText("Meridian Pricing Lens")).toBeVisible();

  await page.goto("/en/creators/demo-collector");
  await expect(page.getByRole("heading", { level: 1, name: "Demo Collector" })).toBeVisible();
  await expect(page.getByText("Nova Gallery Stage")).toBeVisible();
});

async function signInAs(page: Page, email: string, redirectTo: string) {
  await page.goto(
    `/api/dev/session?email=${encodeURIComponent(email)}&redirectTo=${encodeURIComponent(redirectTo)}`
  );
  await page.waitForLoadState("networkidle");
}

async function signOut(page: Page) {
  await page.goto("/api/dev/session?redirectTo=/en");
  await page.waitForLoadState("networkidle");
}

async function fillComponentForm(
  page: Page,
  values: {
    title: string;
    category: string;
    summary: string;
    description: string;
    changelog: string;
    accessType?: "free" | "premium";
    sellerTargetPriceUsd?: string;
  }
) {
  await page.getByLabel("Component title").fill(values.title);
  await page
    .getByRole("checkbox", { name: new RegExp(`^${values.category}\\b`, "i") })
    .check();
  await page.getByLabel("Summary").fill(values.summary);
  await page.getByLabel("Description").fill(values.description);
  await page.getByLabel("Changelog").fill(values.changelog);

  if (values.accessType === "premium") {
    await page.locator('input[name="accessType"]').evaluate((input) => {
      (input as HTMLInputElement).value = "PREMIUM";
    });
    await page.locator('input[name="sellerTargetPriceUsd"]').evaluate((input, price) => {
      (input as HTMLInputElement).value = String(price);
    }, values.sellerTargetPriceUsd ?? "100");
  }

  await page.locator("textarea[name='swiftCode']").fill(sampleSwiftCode(values.title));
  await page.getByTestId("screenshot-input").setInputFiles({
    name: "e2e-component.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });
  await expect(page.getByRole("button", { name: "Remove screenshot" })).toBeVisible();
}

function acceptNextDialog(page: Page) {
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
}

function sampleSwiftCode(title: string) {
  return `import SwiftUI

struct ${title.replace(/[^A-Za-z0-9]/g, "")}: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("${title}")
                .font(.system(size: 32, weight: .bold, design: .rounded))

            Text("A CopyMyUI test component.")
                .foregroundStyle(.secondary)

            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [.orange.opacity(0.24), .white],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 260)
        }
        .padding(24)
    }
}
`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
