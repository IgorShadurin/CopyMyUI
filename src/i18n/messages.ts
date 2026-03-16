import { APP_NAME } from "@/lib/constants";
import type { AppLocale } from "@/i18n/config";

const en = {
  app: {
    name: APP_NAME,
    description:
      "A curated library of moderated SwiftUI components with code, screenshots, and favorites.",
  },
  languages: {
    en: "English",
    es: "Español",
    ru: "Русский",
    de: "Deutsch",
  },
  localeSwitcher: {
    label: "Language",
  },
  common: {
    signedIn: "Signed in",
    user: "User",
    owner: "Owner",
    creator: "Creator",
    anonymousMaker: "Anonymous maker",
    by: "by",
    version: "Version",
  },
  header: {
    explore: "Explore",
    dashboard: "Dashboard",
    moderation: "Moderation",
    admin: "Admin",
    settings: "Settings",
    apiKeys: "API keys",
    newComponent: "New component",
    favorites: "Favorites",
    purchases: "Purchases",
    signOut: "Sign out",
    signInWithGoogle: "Sign in with Google",
    menu: "Menu",
  },
  footer: {
    description:
      "Ship iOS screens faster with ready-to-use SwiftUI components and production-ready code, so you do not rebuild common screens from scratch.",
    exploreComponents: "Explore components",
    creatorDashboard: "Creator dashboard",
    xLabel: "X / Web3Igor",
  },
  devSessions: {
    title: "Dev sessions",
    currentSession: "Current session:",
    signedOut: "signed out",
    switchTo: "Switch to {email}",
    clear: "Clear dev session",
  },
  status: {
    draft: "Draft",
    pendingReview: "Pending review",
    approved: "Approved",
    declined: "Declined",
  },
  categories: {
    navigation: {
      name: "Navigation",
      description: "Tab bars, side rails, pagers, and compact navigational shells.",
    },
    dashboards: {
      name: "Dashboards",
      description: "Metrics, cards, management views, and analytical layouts.",
    },
    commerce: {
      name: "Commerce",
      description: "Pricing flows, product cards, carts, and purchase surfaces.",
    },
    paywall: {
      name: "Paywall",
      description: "Subscription gates, upgrade prompts, and monetization surfaces.",
    },
    social: {
      name: "Social",
      description: "Profile modules, social timelines, and engagement widgets.",
    },
    forms: {
      name: "Forms",
      description: "Multi-step forms, auth screens, and polished field groups.",
    },
    media: {
      name: "Media",
      description: "Galleries, players, carousels, and motion-heavy canvases.",
    },
    gaming: {
      name: "Gaming",
      description: "HUDs, inventories, quest flows, and gameplay overlays.",
    },
  },
  home: {
    title: "Build your SwiftUI library.",
    description:
      "Ship faster with ready-to-use SwiftUI components and production-ready code, so you do not rebuild common screens from scratch.",
    searchPlaceholder: "Search titles, descriptions, creators, dashboards...",
    exploreComponents: "Explore components",
    topRatedNow: "Most favorited right now",
    freshlyApproved: "Freshly added",
    openComponent: "Open component",
    topRatedEyebrow: "Most favorited",
    topRatedTitle: "Favorite-ready building blocks",
    browseEveryComponent: "View all",
    categoryLeadersEyebrow: "Category leaders",
    categoryLeadersTitle: "One standout from every lane",
    premiumEyebrow: "Premium picks",
    premiumTitle: "Curated premium components",
    browsePremium: "Browse premium",
    newestEyebrow: "Newest drops",
    newestTitle: "Recently approved for the gallery",
  },
  explorePage: {
    eyebrow: "Explore",
    title: "Public SwiftUI components",
    description:
      "Search submissions, jump across categories, and save favorites for later.",
    searchPlaceholder: "Search by title, summary, description, or creator",
    allCategories: "All categories",
    allAccessTypes: "All access types",
    freeOnly: "Free only",
    premiumOnly: "Premium only",
    topRated: "Most favorited",
    newest: "Newest",
    updateFilters: "Update filters",
    emptyEyebrow: "No results",
    emptyTitle: "No components matched those filters",
    emptyDescription:
      "Try clearing the category filter or broadening the search term. Approved components will appear here automatically after moderation.",
    resetFilters: "Reset filters",
  },
  detailPage: {
    newRevisionPendingReview: "New revision pending review",
    privatePreview: "Private moderator/owner preview",
    editCurrentDraft: "Edit current draft",
    startUpdateDraft: "Start update draft",
    premiumBadge: "Premium",
    premiumEyebrow: "Premium access",
    premiumTitle: "Unlock the SwiftUI source",
    premiumUnlockedDescription:
      "You already own access to the source for this premium component.",
    premiumLockedDescription:
      "This premium component shows the screenshots publicly, but the SwiftUI code unlocks after purchase.",
    buyerPrice: "Price",
    swiftSourceEyebrow: "SwiftUI source",
    swiftSourceTitle: "Ready code",
    lockedSourcePreviewLabel: "Part of the code preview",
    lockedSourceTitle: "Source hidden until purchase",
    lockedSourceDescription:
      "Public visitors can inspect the screenshots and overview. Buy this component to reveal the full SwiftUI source on this page.",
    buyNowLabel: "Buy now",
    signInToBuy: "Sign in to buy",
    revisionTrailEyebrow: "Latest approval",
    revisionTrailTitle: "Last update",
    needMoreEyebrow: "Need more components?",
    needMoreTitle: "Explore the full public collection",
    needMoreDescription:
      "Browse more approved components across every category and keep your favorites close.",
    exploreAllComponents: "Explore all components",
  },
  dashboardPage: {
    noticeSubmitted: "Your revision was submitted to moderators for review.",
    eyebrow: "Creator dashboard",
    title: "Manage your submissions",
    description:
      "Create drafts, resubmit updates, and track what moderators approved or declined.",
    continueEditing: "Continue editing",
    startUpdate: "Start update",
    reviseDraft: "Revise draft",
    premiumBadge: "Premium",
    viewComponent: "View component",
    emptyEyebrow: "Start building",
    emptyTitle: "No components yet",
    emptyDescription:
      "Draft your first SwiftUI component, upload screenshots, and decide when it is ready for moderation.",
    emptyAction: "Create your first component",
  },
  newComponentPage: {
    noticeSaved: "Draft saved. Keep refining it privately.",
    eyebrow: "New component",
    title: "Create a new component publication",
    description:
      "Set up a new component entry, upload screenshots, and submit when it is ready for moderation.",
  },
  editComponentPage: {
    noticeSaved:
      "Draft saved. Submit it when you want moderators to review the update.",
    eyebrow: "Edit draft",
    description:
      "Approved revisions stay locked. This draft is the only editable version until you submit it again.",
  },
  favoritesPage: {
    eyebrow: "Saved collection",
    title: "Your favorites",
    description:
      "Keep your most useful SwiftUI references close and revisit them whenever you need a starting point.",
    emptyEyebrow: "No favorites yet",
    emptyTitle: "You haven’t saved any components",
    emptyDescription:
      "Browse the public gallery and tap the heart on anything you want to keep in your personal collection.",
    emptyAction: "Browse components",
  },
  purchasesPage: {
    noticePurchased: "Premium component unlocked. The SwiftUI source is now available.",
    eyebrow: "Unlocked library",
    title: "Your premium purchases",
    description:
      "Everything you have unlocked stays here so you can jump back into paid SwiftUI components at any time.",
    emptyEyebrow: "No purchases yet",
    emptyTitle: "No premium purchases yet",
    emptyDescription:
      "Explore the premium catalog, unlock the components you want, and they will stay available in this library.",
    emptyAction: "Browse premium components",
  },
  profilePage: {
    defaultName: "Creator",
    eyebrow: "Creator profile",
    description:
      "Public approved components from this creator. Free releases and premium drops stay visible here without signing in.",
    componentCount: "Approved components",
    premiumCount: "Premium components",
    freeSectionEyebrow: "Shared free components",
    freeSectionTitle: "Releases",
    premiumSectionEyebrow: "Premium components",
    premiumSectionTitle: "Premium",
  },
  categoryPage: {
    eyebrow: "Category collection",
    approvedCount: "Total components",
    paginationPrevious: "Previous",
    paginationNext: "Next",
    paginationPage: "Page",
    premiumCount: "Premium",
    featuredCount: "Featured",
    paywallEyebrow: "Category paywall",
    paywallTitle: "Premium components in this category",
    paywallDescription:
      "These components are visible as screenshots in the public gallery. Purchase any of them to unlock the SwiftUI source.",
    paywallAction: "Browse category premium",
    emptyEyebrow: "No approved components yet",
    emptyTitle: "This category is still warming up",
    emptyDescription:
      "Approved components tagged with this category will show up here automatically after moderation.",
    emptyAction: "Browse all components",
  },
  adminPage: {
    noticeUpdated: "Marketplace markup updated.",
    noticeCategoryUpdated: "Category settings updated.",
    eyebrow: "Admin controls",
    title: "Manage premium marketplace settings",
    description:
      "Adjust the marketplace markup, review premium inventory, and monitor recent premium purchases.",
    markupLabel: "Platform markup percent",
    markupHint:
      "Creators set the payout they want to receive. This markup is added on top for the final buyer price.",
    saveMarkup: "Save markup",
    salesCount: "Sales count",
    grossRevenue: "Gross revenue",
    platformFees: "Platform fees",
    categorySectionEyebrow: "Category controls",
    categorySectionTitle: "Edit category metadata",
    categoryNameLabel: "Category name",
    categorySlugLabel: "Category slug",
    categoryAccentLabel: "Accent style",
    categoryDescriptionLabel: "Default English description",
    categoryUsageLabel: "Assigned components:",
    saveCategory: "Save category",
    premiumSectionEyebrow: "Premium catalog",
    premiumSectionTitle: "Approved premium components",
    recentSalesEyebrow: "Recent sales",
    recentSalesTitle: "Latest premium purchases",
    feeLabel: "Fee:",
  },
  apiKeys: {
    title: "API keys",
    description:
      "Create personal API keys to search the catalog, read your favorites, and optionally unlock premium purchases from scripts or external tools.",
    nameLabel: "Key name",
    namePlaceholder: "Local automation",
    purchaseScopeLabel: "Allow premium purchases",
    create: "Create key",
    save: "Save key",
    delete: "Delete key",
    createdNotice: "API key `{name}` created.",
    createdHint:
      "Copy this key now. For security reasons, the full value is only shown once.",
    fallbackName: "Unnamed key",
    lastUsedLabel: "Last used:",
    neverUsed: "Never used yet",
    createdLabel: "Created:",
    empty: "You have not created any API keys yet.",
    updatedNotice: "API key updated.",
    deletedNotice: "API key deleted.",
    genericError: "Unable to update API keys.",
  },
  moderationPage: {
    noticeApproved: "Revision approved and pushed to the public gallery.",
    noticeDeclined: "Revision declined. The creator can revise and resubmit it.",
    eyebrow: "Moderation queue",
    title: "Review pending submissions",
    description:
      "Approve public releases or decline them with clear guidance so creators can revise and resubmit.",
    pendingRevision: "Pending revision",
    currentPublicVersion: "Current public version",
    revisionHistory: "Revision history",
    queueClearEyebrow: "Queue clear",
    queueClearTitle: "There are no pending revisions",
    queueClearDescription:
      "Creators have either saved drafts privately or moderators have already processed the current queue.",
  },
  moderationForm: {
    noteRequired: "Declining a component requires a moderator note.",
    noteLabel: "Moderator note",
    primaryCategory: "Primary category",
    relatedCategories: "Assigned categories",
    categoryHint: "Choose up to 3 categories. The primary category must remain selected.",
    categorySelectionRequired: "Choose between 1 and 3 categories before approving.",
    notePlaceholder:
      "Explain the decision, especially if you are declining the update.",
    approve: "Approve revision",
    decline: "Decline revision",
  },
  signInPage: {
    eyebrow: "Join the creator workflow",
    title: "Sign in with Google.",
    description:
      "Draft privately, submit polished SwiftUI components, and track moderation from a single dashboard.",
    bulletPrivateDrafts:
      "Private drafts and revision history before anything goes public.",
    bulletScreenshots:
      "Mandatory screenshots and SwiftUI-only source validation.",
    bulletVoting:
      "Favorites and moderator approval after every update.",
    authConfigured:
      "Use your Google account to create, favorite, and moderate components.",
    authNotConfigured:
      "Google auth credentials are not configured locally yet, so Google sign-in will stay unavailable until they are added.",
    continueWithGoogle: "Sign in with Google",
    devShortcuts: "Development shortcuts",
    signInAs: "Sign in as {email}",
  },
  editor: {
    title: "SwiftUI component",
    description:
      "Draft privately, save revisions, and only publish after moderation approval.",
    componentTitle: "Component title",
    componentTitlePlaceholder: "Aurora Tab Orbit",
    primaryCategory: "Primary category",
    primaryCategoryPlaceholder: "Choose a category",
    relatedCategories: "Related categories",
    categoryHint: "Choose up to 3 categories total. The primary category is the main browsing lane.",
    categoryLockedHint:
      "Categories are locked on approved components until a moderator reviews the next revision.",
    primaryCategorySelected: "Primary category",
    relatedCategoryOption: "Optional related category",
    summary: "Summary",
    summaryHint: "Short card text for listings (20-160 characters).",
    descriptionLabel: "Description",
    changelog: "Changelog",
    monetizationTitle: "Monetization",
    monetizationDescription:
      "Choose whether this revision is free or premium. Premium listings stay public as screenshots until someone buys the source.",
    freeOption: "Free",
    freeOptionDescription:
      "Anyone can open the public page and copy the SwiftUI source after approval.",
    premiumOption: "Premium",
    premiumOptionDescription:
      "Show screenshots publicly and hide the SwiftUI source until purchase.",
    sellerTargetPrice: "Your target payout (USD)",
    sellerTargetPriceHint:
      "Set the amount you want to receive. The platform markup is added on top in the marketplace.",
    screenshotsTitle: "Screenshots",
    screenshotsDescription:
      "Upload bright previews that show the component’s finished state.",
    sourceTitle: "SwiftUI source",
    sourceDescription:
      "The editor accepts SwiftUI only. Include a `View` struct and the `body` layout.",
    sourceThemeDark: "Dark",
    sourceThemeLight: "Light",
    saveDraft: "Save draft",
    saveDraftPending: "Saving draft...",
    submitForReview: "Submit for review",
    submitPending: "Submitting...",
  },
  upload: {
    title: "Component screenshots",
    description:
      "Upload 1 to {max} PNG, JPEG, or WebP previews. These images power the card grid and detail page.",
    upload: "Upload",
    uploading: "Uploading...",
    altText: "Alt text",
    removeScreenshot: "Remove screenshot",
    removeScreenshotConfirm: "Remove this screenshot?",
    tooMany: "You can upload up to {max} screenshots.",
    uploadFailed: "Upload failed.",
  },
  share: {
    shareOnX: "Share on X",
    linkedIn: "LinkedIn",
    reddit: "Reddit",
    share: "Share",
    copyLink: "Copy link",
    linkCopied: "Component link copied.",
    shareTextTemplate: "{title} on CopyMyUI",
  },
  favorite: {
    addAria: "Add to favorites",
    removeAria: "Remove from favorites",
    updateFailed: "Unable to update favorite.",
  },
  componentCard: {
    screenshotComingSoon: "Screenshot coming soon",
    featured: "Featured",
    premium: "Premium",
    updatePending: "Update pending",
  },
  codeCopy: {
    button: "Copy code",
    copied: "SwiftUI code copied.",
    expand: "Show full code",
    collapse: "Collapse code",
    authRequiredTitle: "Sign in to copy",
    authRequiredDescription:
      "Continue with Google to copy the SwiftUI source and return to components.",
  },
  notFound: {
    eyebrow: "Not found",
    title: "This page could not be found",
    description:
      "The component or page you requested may be private, missing, or moved.",
    action: "Return home",
  },
  errors: {
    generic: "Something went wrong.",
    formIncomplete: "The form is incomplete.",
    validation: {
      title: "Title must be between 3 and 80 characters.",
      category: "Choose a category.",
      categoryList: "Choose between 1 and 3 categories.",
      name: "Name must be between 2 and 40 characters.",
      slug: "Slug must use lowercase letters, numbers, or hyphens.",
      accent: "Accent style must be between 3 and 80 characters.",
      summary: "Summary must be between 20 and 160 characters.",
      description: "Description must be between 40 and 1400 characters.",
      changelog: "Changelog must be 400 characters or fewer.",
      sellerTargetPriceCents: "Set a valid premium payout price.",
      swiftCode: "SwiftUI code must be between 80 and 100000 characters.",
      screenshots: "Add between 1 and 4 screenshots.",
    },
    service: {
      swiftSourceRequired:
        "SwiftUI code is required. Include `import SwiftUI`, a `View` struct, and a `body` implementation.",
      noPermission: "You do not have permission to change this component.",
      editDraftOnly: "Only draft revisions can be edited.",
      noEditableRevision: "This component does not have an editable revision.",
      waitForModeration: "Wait for moderation before starting another update.",
      submitDraftOnly: "Only draft revisions can be submitted.",
      noActiveRevision: "No active revision exists for this component.",
      reviewPendingOnly: "Only pending revisions can be reviewed.",
      moderationNoteRequired: "Declining a component requires a moderator note.",
      favoriteApprovedOnly: "Only approved components can be favorited.",
      purchaseApprovedPremiumOnly:
        "Only approved premium components can be purchased.",
      ownComponentAccess: "You already have access to your own component.",
      markupPercentRange:
        "Markup percent must be a whole number between 0 and 200.",
      categoryCountRange: "Select between 1 and 3 categories.",
      primaryCategorySelection:
        "Primary category must be one of the selected categories.",
      validCategories: "Choose valid categories.",
      apiKeyNotFound: "API key not found.",
    },
    api: {
      signInToFavorite: "Sign in to save favorites.",
      unableToFavorite: "Unable to update favorite.",
      signInToUpload: "You need to be signed in.",
      uploadCount: "Upload between 1 and {max} screenshots.",
      uploadTypes: "Only PNG, JPEG, and WebP screenshots are supported.",
      uploadSize: "Each screenshot must be 5 MB or smaller.",
    },
  },
};

const es: typeof en = {
  app: {
    name: APP_NAME,
    description:
      "Una biblioteca curada de componentes SwiftUI moderados con código, capturas y favoritos.",
  },
  languages: {
    en: "English",
    es: "Español",
    ru: "Русский",
    de: "Deutsch",
  },
  localeSwitcher: {
    label: "Idioma",
  },
  common: {
    signedIn: "Sesión iniciada",
    user: "Usuario",
    owner: "Propietario",
    creator: "Creador",
    anonymousMaker: "Creador anónimo",
    by: "por",
    version: "Versión",
  },
  header: {
    explore: "Explorar",
    dashboard: "Panel",
    moderation: "Moderación",
    admin: "Administración",
    settings: "Ajustes",
    apiKeys: "Claves API",
    newComponent: "Nuevo componente",
    favorites: "Favoritos",
    purchases: "Compras",
    signOut: "Cerrar sesión",
    signInWithGoogle: "Entrar con Google",
    menu: "Menú",
  },
  footer: {
    description:
      "Crea pantallas iOS más rápido con componentes SwiftUI listos para usar y código listo para producción, para no reconstruir pantallas comunes desde cero.",
    exploreComponents: "Componentes",
    creatorDashboard: "Panel del creador",
    xLabel: "X / Web3Igor",
  },
  devSessions: {
    title: "Sesiones dev",
    currentSession: "Sesión actual:",
    signedOut: "sin sesión",
    switchTo: "Cambiar a {email}",
    clear: "Limpiar sesión dev",
  },
  status: {
    draft: "Borrador",
    pendingReview: "Pendiente de revisión",
    approved: "Aprobado",
    declined: "Rechazado",
  },
  categories: {
    navigation: {
      name: "Navegación",
      description: "Barras de pestañas, rieles laterales, paginadores y estructuras compactas de navegación.",
    },
    dashboards: {
      name: "Paneles",
      description: "Métricas, tarjetas, vistas de gestión y diseños analíticos.",
    },
    commerce: {
      name: "Comercio",
      description: "Flujos de precios, tarjetas de producto, carritos y superficies de compra.",
    },
    paywall: {
      name: "Muro de pago",
      description: "Bloqueos de suscripción, avisos de mejora y superficies de monetización.",
    },
    social: {
      name: "Sociales",
      description: "Módulos de perfil, timelines sociales y widgets de interacción.",
    },
    forms: {
      name: "Formularios",
      description: "Formularios multi paso, pantallas de acceso y grupos de campos pulidos.",
    },
    media: {
      name: "Medios",
      description: "Galerías, reproductores, carruseles y lienzos con mucho movimiento.",
    },
    gaming: {
      name: "Juegos",
      description: "HUD, inventarios, flujos de misiones y superposiciones de juego.",
    },
  },
  home: {
    title: "Crea tu biblioteca SwiftUI.",
    description:
      "Publica más rápido con componentes SwiftUI listos para usar y código listo para producción, para no volver a crear pantallas comunes desde cero.",
    searchPlaceholder: "Buscar títulos, descripciones, creadores y dashboards...",
    exploreComponents: "Explorar componentes",
    topRatedNow: "Más guardados ahora",
    freshlyApproved: "Recién añadido",
    openComponent: "Abrir componente",
    topRatedEyebrow: "Más guardados",
    topRatedTitle: "Bloques listos para guardar en favoritos",
    browseEveryComponent: "Ver todo",
    categoryLeadersEyebrow: "Líderes por categoría",
    categoryLeadersTitle: "Una pieza destacada en cada área",
    premiumEyebrow: "Selección premium",
    premiumTitle: "Componentes premium curados",
    browsePremium: "Ver premium",
    newestEyebrow: "Novedades",
    newestTitle: "Recién aprobados para la galería",
  },
  explorePage: {
    eyebrow: "Explorar",
    title: "Componentes SwiftUI públicos",
    description:
      "Busca envíos aprobados, salta entre categorías y guarda favoritos para más tarde.",
    searchPlaceholder: "Buscar por título o autor",
    allCategories: "Todas las categorías",
    allAccessTypes: "Todos los accesos",
    freeOnly: "Solo gratis",
    premiumOnly: "Solo premium",
    topRated: "Más guardados",
    newest: "Más nuevos",
    updateFilters: "Actualizar filtros",
    emptyEyebrow: "Sin resultados",
    emptyTitle: "Ningún componente coincide con esos filtros",
    emptyDescription:
      "Prueba limpiar la categoría o ampliar el término de búsqueda. Los componentes aprobados aparecerán aquí automáticamente tras la moderación.",
    resetFilters: "Restablecer filtros",
  },
  detailPage: {
    newRevisionPendingReview: "Nueva revisión pendiente",
    privatePreview: "Vista privada para moderador/propietario",
    editCurrentDraft: "Editar borrador actual",
    startUpdateDraft: "Iniciar borrador de actualización",
    premiumBadge: "De pago",
    premiumEyebrow: "Acceso premium",
    premiumTitle: "Desbloquea el código SwiftUI",
    premiumUnlockedDescription:
      "Ya tienes acceso al código fuente de este componente premium.",
    premiumLockedDescription:
      "Este componente premium muestra las capturas públicamente, pero el código SwiftUI se desbloquea después de la compra.",
    buyerPrice: "Precio",
    swiftSourceEyebrow: "Código SwiftUI",
    swiftSourceTitle: "Código listo",
    lockedSourcePreviewLabel: "Vista previa parcial del código",
    lockedSourceTitle: "Código oculto hasta la compra",
    lockedSourceDescription:
      "Los visitantes públicos pueden revisar las capturas y el resumen. Compra este componente para revelar el código SwiftUI completo en esta página.",
    buyNowLabel: "Comprar ahora",
    signInToBuy: "Entrar para comprar",
    revisionTrailEyebrow: "Última aprobación",
    revisionTrailTitle: "Última actualización",
    needMoreEyebrow: "¿Necesitas más componentes?",
    needMoreTitle: "Explora la colección pública completa",
    needMoreDescription:
      "Descubre más componentes aprobados en cada categoría y mantén tus favoritos cerca.",
    exploreAllComponents: "Explorar todos los componentes",
  },
  dashboardPage: {
    noticeSubmitted: "Tu revisión fue enviada a los moderadores para su revisión.",
    eyebrow: "Panel del creador",
    title: "Gestiona tus envíos",
    description:
      "Crea borradores, vuelve a enviar actualizaciones y sigue lo que los moderadores aprobaron o rechazaron.",
    continueEditing: "Seguir editando",
    startUpdate: "Iniciar actualización",
    reviseDraft: "Revisar borrador",
    premiumBadge: "De pago",
    viewComponent: "Ver componente",
    emptyEyebrow: "Empieza a crear",
    emptyTitle: "Sin componentes todavía",
    emptyDescription:
      "Redacta tu primer componente SwiftUI, sube capturas y decide cuándo está listo para moderación.",
    emptyAction: "Crear tu primer componente",
  },
  newComponentPage: {
    noticeSaved: "Borrador guardado. Sigue refinándolo en privado.",
    eyebrow: "Nuevo componente",
    title: "Crea una nueva publicación de componente",
    description:
      "Configura una nueva publicación del componente, sube capturas y envíala cuando esté lista para moderación.",
  },
  editComponentPage: {
    noticeSaved: "Borrador guardado. Envíalo cuando quieras que los moderadores revisen la actualización.",
    eyebrow: "Editar borrador",
    description:
      "Las revisiones aprobadas quedan bloqueadas. Este borrador es la única versión editable hasta que lo vuelvas a enviar.",
  },
  favoritesPage: {
    eyebrow: "Colección guardada",
    title: "Tus favoritos",
    description:
      "Mantén cerca tus referencias SwiftUI más útiles y vuelve a ellas cuando necesites un punto de partida.",
    emptyEyebrow: "Sin favoritos todavía",
    emptyTitle: "No has guardado ningún componente",
    emptyDescription:
      "Explora la galería pública y toca el corazón en cualquier elemento que quieras conservar en tu colección personal.",
    emptyAction: "Explorar componentes",
  },
  purchasesPage: {
    noticePurchased:
      "Componente premium desbloqueado. El código SwiftUI ya está disponible.",
    eyebrow: "Biblioteca desbloqueada",
    title: "Tus compras premium",
    description:
      "Todo lo que desbloquees queda aquí para que vuelvas a los componentes SwiftUI de pago cuando quieras.",
    emptyEyebrow: "Aún no hay compras",
    emptyTitle: "Sin compras premium todavía",
    emptyDescription:
      "Explora el catálogo premium, desbloquea los componentes que quieras y seguirán disponibles en esta biblioteca.",
    emptyAction: "Explorar componentes premium",
  },
  profilePage: {
    defaultName: "Creador",
    eyebrow: "Perfil del creador",
    description:
      "Componentes públicos aprobados de este creador. Los lanzamientos gratuitos y premium siguen visibles aquí sin iniciar sesión.",
    componentCount: "Componentes aprobados",
    premiumCount: "Componentes premium",
    freeSectionEyebrow: "Componentes gratuitos compartidos",
    freeSectionTitle: "Lanzamientos",
    premiumSectionEyebrow: "Componentes premium",
    premiumSectionTitle: "Lanzamientos premium aprobados",
  },
  categoryPage: {
    eyebrow: "Colección de categoría",
    approvedCount: "Componentes totales",
    paginationPrevious: "Anterior",
    paginationNext: "Siguiente",
    paginationPage: "Página",
    premiumCount: "Kostenpflichtig",
    featuredCount: "Destacados",
    paywallEyebrow: "Paywall de la categoría",
    paywallTitle: "Componentes premium en esta categoría",
    paywallDescription:
      "Estos componentes se muestran como capturas en la galería pública. Compra cualquiera para desbloquear el código SwiftUI.",
    paywallAction: "Ver premium de la categoría",
    emptyEyebrow: "Todavía no hay componentes aprobados",
    emptyTitle: "Esta categoría aún está arrancando",
    emptyDescription:
      "Los componentes aprobados con esta categoría aparecerán aquí automáticamente después de la moderación.",
    emptyAction: "Explorar todos los componentes",
  },
  adminPage: {
    noticeUpdated: "El margen del marketplace fue actualizado.",
    noticeCategoryUpdated: "La configuración de la categoría fue actualizada.",
    eyebrow: "Controles de admin",
    title: "Gestiona la configuración del marketplace premium",
    description:
      "Ajusta el margen del marketplace, revisa el inventario premium y supervisa las compras premium recientes.",
    markupLabel: "Porcentaje de margen de la plataforma",
    markupHint:
      "Los creadores fijan el pago que quieren recibir. Este margen se suma encima para calcular el precio final del comprador.",
    saveMarkup: "Guardar margen",
    salesCount: "Número de ventas",
    grossRevenue: "Ingresos brutos",
    platformFees: "Comisiones de la plataforma",
    categorySectionEyebrow: "Controles de categorías",
    categorySectionTitle: "Editar metadatos de categorías",
    categoryNameLabel: "Nombre de la categoría",
    categorySlugLabel: "Slug de la categoría",
    categoryAccentLabel: "Estilo de acento",
    categoryDescriptionLabel: "Descripción predeterminada en inglés",
    categoryUsageLabel: "Componentes asignados:",
    saveCategory: "Guardar categoría",
    premiumSectionEyebrow: "Catálogo premium",
    premiumSectionTitle: "Componentes premium aprobados",
    recentSalesEyebrow: "Ventas recientes",
    recentSalesTitle: "Últimas compras premium",
    feeLabel: "Comisión:",
  },
  apiKeys: {
    title: "Claves API",
    description:
      "Crea claves API personales para buscar en el catálogo, leer tus favoritos y, opcionalmente, desbloquear compras premium desde scripts o herramientas externas.",
    nameLabel: "Nombre de la clave",
    namePlaceholder: "Automatización local",
    purchaseScopeLabel: "Permitir compras premium",
    create: "Crear clave",
    save: "Guardar clave",
    delete: "Eliminar clave",
    createdNotice: "La clave API `{name}` fue creada.",
    createdHint:
      "Copia esta clave ahora. Por seguridad, el valor completo solo se muestra una vez.",
    fallbackName: "Clave sin nombre",
    lastUsedLabel: "Último uso:",
    neverUsed: "Todavía no se usó",
    createdLabel: "Creada:",
    empty: "Todavía no has creado claves API.",
    updatedNotice: "Clave API actualizada.",
    deletedNotice: "Clave API eliminada.",
    genericError: "No fue posible actualizar las claves API.",
  },
  moderationPage: {
    noticeApproved: "La revisión fue aprobada y publicada en la galería pública.",
    noticeDeclined: "La revisión fue rechazada. El creador puede corregirla y volver a enviarla.",
    eyebrow: "Cola de moderación",
    title: "Revisar envíos pendientes",
    description:
      "Aprueba publicaciones públicas o recházalas con indicaciones claras para que los creadores puedan corregirlas y reenviarlas.",
    pendingRevision: "Revisión pendiente",
    currentPublicVersion: "Versión pública actual",
    revisionHistory: "Historial de revisiones",
    queueClearEyebrow: "Cola vacía",
    queueClearTitle: "No hay revisiones pendientes",
    queueClearDescription:
      "Los creadores han dejado borradores privados o los moderadores ya procesaron la cola actual.",
  },
  moderationForm: {
    noteRequired: "Rechazar un componente requiere una nota del moderador.",
    noteLabel: "Nota del moderador",
    primaryCategory: "Categoría principal",
    relatedCategories: "Categorías asignadas",
    categoryHint:
      "Elige hasta 3 categorías. La categoría principal debe seguir seleccionada.",
    categorySelectionRequired:
      "Elige entre 1 y 3 categorías antes de aprobar.",
    notePlaceholder:
      "Explica la decisión, especialmente si vas a rechazar la actualización.",
    approve: "Aprobar revisión",
    decline: "Rechazar revisión",
  },
  signInPage: {
    eyebrow: "Únete al flujo del creador",
    title: "Inicia sesión con Google.",
    description:
      "Trabaja en privado, envía componentes SwiftUI pulidos y sigue la moderación desde un único panel.",
    bulletPrivateDrafts:
      "Borradores privados e historial de revisiones antes de que algo se haga público.",
    bulletScreenshots:
      "Capturas obligatorias y validación de código solo SwiftUI.",
    bulletVoting:
      "Favoritos y aprobación del moderador después de cada actualización.",
    authConfigured:
      "Usa tu cuenta de Google para crear, guardar favoritos y moderar componentes.",
    authNotConfigured:
      "Las credenciales de Google aún no están configuradas localmente, así que el acceso con Google seguirá desactivado hasta que se añadan.",
    continueWithGoogle: "Iniciar sesión con Google",
    devShortcuts: "Accesos directos de desarrollo",
    signInAs: "Entrar como {email}",
  },
  editor: {
    title: "Componente SwiftUI",
    description:
      "Trabaja en privado, guarda revisiones y publica solo después de la aprobación del moderador.",
    componentTitle: "Título del componente",
    componentTitlePlaceholder: "Orbita Aurora",
    primaryCategory: "Categoría principal",
    primaryCategoryPlaceholder: "Elige una categoría",
    relatedCategories: "Categorías relacionadas",
    categoryHint:
      "Elige hasta 3 categorías en total. La categoría principal es la vía principal de navegación.",
    categoryLockedHint:
      "Las categorías quedan bloqueadas en componentes aprobados hasta que un moderador revise la siguiente revisión.",
    primaryCategorySelected: "Categoría principal",
    relatedCategoryOption: "Categoría relacionada opcional",
    summary: "Resumen",
    summaryHint: "Texto corto para tarjetas y listados (20-160 caracteres).",
    descriptionLabel: "Descripción",
    changelog: "Registro de cambios",
    monetizationTitle: "Monetización",
    monetizationDescription:
      "Elige si esta revisión será gratis o premium. Los listados premium siguen públicos como capturas hasta que alguien compre el código.",
    freeOption: "Gratis",
    freeOptionDescription:
      "Cualquiera puede abrir la página pública y copiar el código SwiftUI después de la aprobación.",
    premiumOption: "De pago",
    premiumOptionDescription:
      "Muestra las capturas públicamente y oculta el código SwiftUI hasta la compra.",
    sellerTargetPrice: "Tu pago objetivo (USD)",
    sellerTargetPriceHint:
      "Define la cantidad que quieres recibir. El margen de la plataforma se suma encima en el marketplace.",
    screenshotsTitle: "Capturas",
    screenshotsDescription:
      "Sube vistas claras que muestren el estado final del componente.",
    sourceTitle: "Código SwiftUI",
    sourceDescription:
      "El editor acepta solo SwiftUI. Incluye una estructura `View` y el layout `body`.",
    sourceThemeDark: "Oscuro",
    sourceThemeLight: "Claro",
    saveDraft: "Guardar borrador",
    saveDraftPending: "Guardando borrador...",
    submitForReview: "Enviar para revisión",
    submitPending: "Enviando...",
  },
  upload: {
    title: "Capturas del componente",
    description:
      "Sube entre 1 y {max} vistas PNG, JPEG o WebP. Estas imágenes alimentan la cuadrícula y la página de detalle.",
    upload: "Subir",
    uploading: "Subiendo...",
    altText: "Texto alternativo",
    removeScreenshot: "Eliminar captura",
    removeScreenshotConfirm: "¿Eliminar esta captura?",
    tooMany: "Puedes subir hasta {max} capturas.",
    uploadFailed: "La subida falló.",
  },
  share: {
    shareOnX: "Compartir en X",
    linkedIn: "LinkedIn",
    reddit: "Reddit",
    share: "Compartir",
    copyLink: "Copiar enlace",
    linkCopied: "Enlace del componente copiado.",
    shareTextTemplate: "{title} en CopyMyUI",
  },
  favorite: {
    addAria: "Agregar a favoritos",
    removeAria: "Quitar de favoritos",
    updateFailed: "No se pudo actualizar el favorito.",
  },
  componentCard: {
    screenshotComingSoon: "La captura llegará pronto",
    featured: "Destacado",
    premium: "De pago",
    updatePending: "Actualización pendiente",
  },
  codeCopy: {
    button: "Copiar código",
    copied: "Código SwiftUI copiado.",
    expand: "Ver código completo",
    collapse: "Ocultar código",
    authRequiredTitle: "Inicia sesión para copiar",
    authRequiredDescription:
      "Continúa con Google para copiar el código SwiftUI y volver a los componentes.",
  },
  notFound: {
    eyebrow: "No encontrado",
    title: "No se pudo encontrar esta página",
    description:
      "El componente o la página solicitada puede ser privada, inexistente o haberse movido.",
    action: "Volver al inicio",
  },
  errors: {
    generic: "Algo salió mal.",
    formIncomplete: "El formulario está incompleto.",
    validation: {
      title: "El título debe tener entre 3 y 80 caracteres.",
      category: "Elige una categoría.",
      categoryList: "Elige entre 1 y 3 categorías.",
      name: "El nombre debe tener entre 2 y 40 caracteres.",
      slug: "El slug debe usar letras minúsculas, números o guiones.",
      accent: "El estilo de acento debe tener entre 3 y 80 caracteres.",
      summary: "El resumen debe tener entre 20 y 160 caracteres.",
      description: "La descripción debe tener entre 40 y 1400 caracteres.",
      changelog: "El registro de cambios debe tener 400 caracteres o menos.",
      sellerTargetPriceCents: "Define un precio válido para el pago premium.",
      swiftCode: "El código SwiftUI debe tener entre 80 y 100000 caracteres.",
      screenshots: "Agrega entre 1 y 4 capturas.",
    },
    service: {
      swiftSourceRequired:
        "Se requiere código SwiftUI. Incluye `import SwiftUI`, una estructura `View` y una implementación de `body`.",
      noPermission: "No tienes permiso para modificar este componente.",
      editDraftOnly: "Solo se pueden editar revisiones en borrador.",
      noEditableRevision: "Este componente no tiene una revisión editable.",
      waitForModeration: "Espera a la moderación antes de iniciar otra actualización.",
      submitDraftOnly: "Solo se pueden enviar revisiones en borrador.",
      noActiveRevision: "No existe una revisión activa para este componente.",
      reviewPendingOnly: "Solo se pueden revisar revisiones pendientes.",
      moderationNoteRequired: "Rechazar un componente requiere una nota del moderador.",
      favoriteApprovedOnly: "Solo se pueden guardar como favoritos los componentes aprobados.",
      purchaseApprovedPremiumOnly:
        "Solo se pueden comprar componentes premium aprobados.",
      ownComponentAccess: "Ya tienes acceso a tu propio componente.",
      markupPercentRange:
        "El porcentaje de margen debe ser un número entero entre 0 y 200.",
      categoryCountRange: "Elige entre 1 y 3 categorías.",
      primaryCategorySelection:
        "La categoría principal debe formar parte de las categorías seleccionadas.",
      validCategories: "Elige categorías válidas.",
      apiKeyNotFound: "No se encontró la clave API.",
    },
    api: {
      signInToFavorite: "Inicia sesión para guardar favoritos.",
      unableToFavorite: "No se pudo actualizar el favorito.",
      signInToUpload: "Debes iniciar sesión.",
      uploadCount: "Sube entre 1 y {max} capturas.",
      uploadTypes: "Solo se admiten capturas PNG, JPEG y WebP.",
      uploadSize: "Cada captura debe pesar 5 MB o menos.",
    },
  },
};

const ru: typeof en = {
  app: {
    name: APP_NAME,
    description:
      "Курируемая библиотека модерируемых SwiftUI-компонентов с кодом, скриншотами и избранным.",
  },
  languages: {
    en: "English",
    es: "Español",
    ru: "Русский",
    de: "Deutsch",
  },
  localeSwitcher: {
    label: "Язык",
  },
  common: {
    signedIn: "Выполнен вход",
    user: "Пользователь",
    owner: "Владелец",
    creator: "Автор",
    anonymousMaker: "Анонимный автор",
    by: "от",
    version: "Версия",
  },
  header: {
    explore: "Каталог",
    dashboard: "Панель",
    moderation: "Модерация",
    admin: "Админ",
    settings: "Настройки",
    apiKeys: "API-ключи",
    newComponent: "Новый компонент",
    favorites: "Избранное",
    purchases: "Покупки",
    signOut: "Выйти",
    signInWithGoogle: "Войти через Google",
    menu: "Меню",
  },
  footer: {
    description:
      "Собирайте iOS-экраны быстрее с готовыми SwiftUI-компонентами и кодом, готовым к выпуску, чтобы не делать типовые экраны с нуля.",
    exploreComponents: "Компоненты",
    creatorDashboard: "Панель автора",
    xLabel: "X / Web3Igor",
  },
  devSessions: {
    title: "Dev-сессии",
    currentSession: "Текущая сессия:",
    signedOut: "вы не вошли",
    switchTo: "Переключиться на {email}",
    clear: "Очистить dev-сессию",
  },
  status: {
    draft: "Черновик",
    pendingReview: "На проверке",
    approved: "Одобрено",
    declined: "Отклонено",
  },
  categories: {
    navigation: {
      name: "Навигация",
      description: "Таб-бары, боковые рельсы, пейджеры и компактные навигационные оболочки.",
    },
    dashboards: {
      name: "Дашборды",
      description: "Метрики, карточки, управленческие экраны и аналитические макеты.",
    },
    commerce: {
      name: "Коммерция",
      description: "Витрины товаров, карточки, корзина и оформление покупки.",
    },
    paywall: {
      name: "Пейволл",
      description: "Экраны подписки, предложения апгрейда и элементы монетизации.",
    },
    social: {
      name: "Социальное",
      description: "Профили, социальные ленты и элементы взаимодействия.",
    },
    forms: {
      name: "Формы",
      description: "Многошаговые формы, экраны авторизации и аккуратные группы полей.",
    },
    media: {
      name: "Медиа",
      description: "Галереи, плееры, карусели и интерфейсы с насыщенной анимацией.",
    },
    gaming: {
      name: "Игры",
      description: "HUD, инвентари, сценарии квестов и игровые оверлеи.",
    },
  },
  home: {
    title: "Создайте свою SwiftUI-библиотеку.",
    description:
      "Создавайте приложения быстрее: готовые SwiftUI-компоненты и рабочий код помогут не собирать одни и те же экраны заново.",
    searchPlaceholder: "Ищите названия, описания, авторов и дашборды...",
    exploreComponents: "Смотреть компоненты",
    topRatedNow: "Самое сохраненное сейчас",
    freshlyApproved: "Недавно добавлено",
    openComponent: "Открыть компонент",
    topRatedEyebrow: "Популярное",
    topRatedTitle: "Блоки, которые хочется добавить в избранное",
    browseEveryComponent: "Смотреть все",
    categoryLeadersEyebrow: "Лидеры категорий",
    categoryLeadersTitle: "По одному сильному примеру в каждом направлении",
    premiumEyebrow: "Премиум-подборка",
    premiumTitle: "Курируемые премиум-компоненты",
    browsePremium: "Смотреть премиум",
    newestEyebrow: "Новые релизы",
    newestTitle: "Недавно одобрено для галереи",
  },
  explorePage: {
    eyebrow: "Каталог",
    title: "Публичные SwiftUI-компоненты",
    description:
      "Ищите одобренные публикации, переключайтесь между категориями и сохраняйте избранное.",
    searchPlaceholder: "Поиск по названию или автору",
    allCategories: "Все категории",
    allAccessTypes: "Все типы доступа",
    freeOnly: "Только бесплатно",
    premiumOnly: "Только премиум",
    topRated: "По избранному",
    newest: "Сначала новые",
    updateFilters: "Обновить фильтры",
    emptyEyebrow: "Ничего не найдено",
    emptyTitle: "По этим фильтрам компонентов нет",
    emptyDescription:
      "Попробуйте убрать фильтр категории или расширить запрос. Одобренные компоненты появятся здесь автоматически после модерации.",
    resetFilters: "Сбросить фильтры",
  },
  detailPage: {
    newRevisionPendingReview: "Новая версия ожидает проверки",
    privatePreview: "Приватный просмотр для владельца/модератора",
    editCurrentDraft: "Редактировать текущий черновик",
    startUpdateDraft: "Начать черновик обновления",
    premiumBadge: "Премиум",
    premiumEyebrow: "Премиум-доступ",
    premiumTitle: "Откройте SwiftUI-исходник",
    premiumUnlockedDescription:
      "У вас уже есть доступ к исходному коду этого премиум-компонента.",
    premiumLockedDescription:
      "У этого премиум-компонента скриншоты видны публично, а SwiftUI-код открывается после покупки.",
    buyerPrice: "Цена",
    swiftSourceEyebrow: "Исходник SwiftUI",
    swiftSourceTitle: "Готовый код",
    lockedSourcePreviewLabel: "Предпросмотр части кода",
    lockedSourceTitle: "Исходник скрыт до покупки",
    lockedSourceDescription:
      "Публичные посетители могут посмотреть скриншоты и описание. Купите компонент, чтобы открыть полный SwiftUI-код на этой странице.",
    buyNowLabel: "Купить сейчас",
    signInToBuy: "Войти для покупки",
    revisionTrailEyebrow: "Последнее одобрение",
    revisionTrailTitle: "Последнее обновление",
    needMoreEyebrow: "Нужны ещё компоненты?",
    needMoreTitle: "Откройте всю публичную коллекцию",
    needMoreDescription:
      "Смотрите больше одобренных компонентов по всем категориям и держите избранное под рукой.",
    exploreAllComponents: "Посмотреть все компоненты",
  },
  dashboardPage: {
    noticeSubmitted: "Ваша ревизия отправлена модераторам на проверку.",
    eyebrow: "Панель автора",
    title: "Управляйте своими публикациями",
    description:
      "Создавайте черновики, повторно отправляйте обновления и отслеживайте, что модераторы одобрили или отклонили.",
    continueEditing: "Продолжить редактирование",
    startUpdate: "Начать обновление",
    reviseDraft: "Доработать черновик",
    premiumBadge: "Премиум",
    viewComponent: "Открыть компонент",
    emptyEyebrow: "Начните создавать",
    emptyTitle: "Компонентов пока нет",
    emptyDescription:
      "Соберите свой первый SwiftUI-компонент, загрузите скриншоты и решите, когда отправить его на модерацию.",
    emptyAction: "Создать первый компонент",
  },
  newComponentPage: {
    noticeSaved: "Черновик сохранён. Продолжайте дорабатывать его приватно.",
    eyebrow: "Новый компонент",
    title: "Создайте новую публикацию компонента",
    description:
      "Подготовьте новую публикацию компонента, загрузите скриншоты и отправьте её на модерацию, когда всё будет готово.",
  },
  editComponentPage: {
    noticeSaved: "Черновик сохранён. Отправьте его, когда захотите передать обновление модераторам.",
    eyebrow: "Редактирование черновика",
    description:
      "Одобренные ревизии заблокированы. Этот черновик — единственная редактируемая версия, пока вы снова не отправите её на проверку.",
  },
  favoritesPage: {
    eyebrow: "Сохранённая коллекция",
    title: "Ваше избранное",
    description:
      "Держите самые полезные SwiftUI-референсы рядом и возвращайтесь к ним, когда нужен стартовый шаблон.",
    emptyEyebrow: "Избранного пока нет",
    emptyTitle: "Вы ещё ничего не сохранили",
    emptyDescription:
      "Откройте публичную галерею и нажмите на сердце у любого элемента, который хотите сохранить в личной коллекции.",
    emptyAction: "Смотреть компоненты",
  },
  purchasesPage: {
    noticePurchased:
      "Премиум-компонент разблокирован. SwiftUI-исходник теперь доступен.",
    eyebrow: "Разблокированная библиотека",
    title: "Ваши премиум-покупки",
    description:
      "Все разблокированные компоненты остаются здесь, чтобы вы могли в любой момент вернуться к платным SwiftUI-компонентам.",
    emptyEyebrow: "Покупок пока нет",
    emptyTitle: "Премиум-покупок пока нет",
    emptyDescription:
      "Откройте премиум-каталог, разблокируйте нужные компоненты, и они останутся доступны в этой библиотеке.",
    emptyAction: "Смотреть премиум-компоненты",
  },
  profilePage: {
    defaultName: "Автор",
    eyebrow: "Профиль автора",
    description:
      "Публичные одобренные компоненты этого автора. Бесплатные релизы и премиум-дропы видны здесь без входа в систему.",
    componentCount: "Одобренные компоненты",
    premiumCount: "Премиум-компоненты",
    freeSectionEyebrow: "Бесплатные опубликованные компоненты",
    freeSectionTitle: "Релизы",
    premiumSectionEyebrow: "Премиум-компоненты",
    premiumSectionTitle: "Одобренные премиум-релизы",
  },
  categoryPage: {
    eyebrow: "Коллекция категории",
    approvedCount: "Всего компонентов",
    paginationPrevious: "Назад",
    paginationNext: "Далее",
    paginationPage: "Страница",
    premiumCount: "Премиум",
    featuredCount: "Избранное",
    paywallEyebrow: "Премиум-доступ категории",
    paywallTitle: "Премиум-компоненты этой категории",
    paywallDescription:
      "Эти компоненты в публичной галерее показываются только скриншотами. Купите любой, чтобы открыть SwiftUI-код.",
    paywallAction: "Смотреть премиум категории",
    emptyEyebrow: "Пока нет одобренных компонентов",
    emptyTitle: "Эта категория только набирает обороты",
    emptyDescription:
      "Одобренные компоненты с этой категорией появятся здесь автоматически после модерации.",
    emptyAction: "Смотреть все компоненты",
  },
  adminPage: {
    noticeUpdated: "Маркаплейс-наценка обновлена.",
    noticeCategoryUpdated: "Настройки категории обновлены.",
    eyebrow: "Админ-панель",
    title: "Управление настройками премиум-маркетплейса",
    description:
      "Настраивайте наценку маркетплейса, просматривайте премиум-каталог и следите за последними премиум-покупками.",
    markupLabel: "Процент наценки платформы",
    markupHint:
      "Авторы задают сумму, которую хотят получить. Эта наценка добавляется сверху для финальной цены покупателя.",
    saveMarkup: "Сохранить наценку",
    salesCount: "Количество продаж",
    grossRevenue: "Валовая выручка",
    platformFees: "Комиссия платформы",
    categorySectionEyebrow: "Управление категориями",
    categorySectionTitle: "Редактирование метаданных категорий",
    categoryNameLabel: "Название категории",
    categorySlugLabel: "Slug категории",
    categoryAccentLabel: "Стиль акцента",
    categoryDescriptionLabel: "Описание по умолчанию на английском",
    categoryUsageLabel: "Назначено компонентам:",
    saveCategory: "Сохранить категорию",
    premiumSectionEyebrow: "Премиум-каталог",
    premiumSectionTitle: "Одобренные премиум-компоненты",
    recentSalesEyebrow: "Последние продажи",
    recentSalesTitle: "Последние премиум-покупки",
    feeLabel: "Комиссия:",
  },
  apiKeys: {
    title: "API-ключи",
    description:
      "Создавайте персональные API-ключи для поиска по каталогу, чтения избранного и, при необходимости, покупки премиум-компонентов из скриптов или внешних инструментов.",
    nameLabel: "Название ключа",
    namePlaceholder: "Локальная автоматизация",
    purchaseScopeLabel: "Разрешить премиум-покупки",
    create: "Создать ключ",
    save: "Сохранить ключ",
    delete: "Удалить ключ",
    createdNotice: "API-ключ `{name}` создан.",
    createdHint:
      "Скопируйте этот ключ сейчас. По соображениям безопасности полное значение показывается только один раз.",
    fallbackName: "Ключ без названия",
    lastUsedLabel: "Последнее использование:",
    neverUsed: "Ещё не использовался",
    createdLabel: "Создан:",
    empty: "Вы ещё не создали ни одного API-ключа.",
    updatedNotice: "API-ключ обновлён.",
    deletedNotice: "API-ключ удалён.",
    genericError: "Не удалось обновить API-ключи.",
  },
  moderationPage: {
    noticeApproved: "Ревизия одобрена и опубликована в публичной галерее.",
    noticeDeclined: "Ревизия отклонена. Автор может доработать и отправить её снова.",
    eyebrow: "Очередь модерации",
    title: "Проверьте ожидающие публикации",
    description:
      "Одобряйте публичные релизы или отклоняйте их с понятной обратной связью, чтобы авторы могли исправить и переотправить.",
    pendingRevision: "Ожидающая ревизия",
    currentPublicVersion: "Текущая публичная версия",
    revisionHistory: "История ревизий",
    queueClearEyebrow: "Очередь пуста",
    queueClearTitle: "Ожидающих ревизий нет",
    queueClearDescription:
      "Авторы либо держат приватные черновики, либо модераторы уже обработали текущую очередь.",
  },
  moderationForm: {
    noteRequired: "Для отклонения компонента нужна заметка модератора.",
    noteLabel: "Комментарий модератора",
    primaryCategory: "Основная категория",
    relatedCategories: "Назначенные категории",
    categoryHint:
      "Выберите до 3 категорий. Основная категория должна оставаться выбранной.",
    categorySelectionRequired:
      "Перед одобрением выберите от 1 до 3 категорий.",
    notePlaceholder:
      "Объясните решение, особенно если вы отклоняете обновление.",
    approve: "Одобрить ревизию",
    decline: "Отклонить ревизию",
  },
  signInPage: {
    eyebrow: "Присоединяйтесь к рабочему процессу автора",
    title: "Войдите через Google.",
    description:
      "Ведите работу приватно, отправляйте polished SwiftUI-компоненты и отслеживайте модерацию из одной панели.",
    bulletPrivateDrafts:
      "Приватные черновики и история ревизий до публикации.",
    bulletScreenshots:
      "Обязательные скриншоты и валидация только SwiftUI-кода.",
    bulletVoting:
      "Избранное и модерация после каждого обновления.",
    authConfigured:
      "Используйте Google-аккаунт, чтобы создавать, добавлять в избранное и модерировать компоненты.",
    authNotConfigured:
      "Локально ещё не настроены ключи Google Auth, поэтому вход через Google останется недоступным, пока их не добавят.",
    continueWithGoogle: "Войти через Google",
    devShortcuts: "Dev-ярлыки",
    signInAs: "Войти как {email}",
  },
  editor: {
    title: "SwiftUI-компонент",
    description:
      "Работайте приватно, сохраняйте ревизии и публикуйте только после одобрения модератора.",
    componentTitle: "Название компонента",
    componentTitlePlaceholder: "Орбита Аврора",
    primaryCategory: "Основная категория",
    primaryCategoryPlaceholder: "Выберите категорию",
    relatedCategories: "Связанные категории",
    categoryHint:
      "Выберите до 3 категорий всего. Основная категория задаёт основное направление каталога.",
    categoryLockedHint:
      "У одобренных компонентов категории блокируются до тех пор, пока модератор не проверит следующую ревизию.",
    primaryCategorySelected: "Основная категория",
    relatedCategoryOption: "Необязательная связанная категория",
    summary: "Краткое описание",
    summaryHint: "Короткий текст для карточек и списков (20-160 символов).",
    descriptionLabel: "Описание",
    changelog: "Список изменений",
    monetizationTitle: "Монетизация",
    monetizationDescription:
      "Выберите, будет ли эта ревизия бесплатной или премиум. Премиум-листинги остаются публичными как скриншоты, пока кто-то не купит исходник.",
    freeOption: "Бесплатно",
    freeOptionDescription:
      "Любой сможет открыть публичную страницу и скопировать SwiftUI-код после одобрения.",
    premiumOption: "Премиум",
    premiumOptionDescription:
      "Показывайте скриншоты публично и скрывайте SwiftUI-код до покупки.",
    sellerTargetPrice: "Желаемая выплата (USD)",
    sellerTargetPriceHint:
      "Укажите сумму, которую хотите получить. На маркетплейсе поверх неё добавляется наценка платформы.",
    screenshotsTitle: "Скриншоты",
    screenshotsDescription:
      "Загрузите яркие превью, которые показывают финальное состояние компонента.",
    sourceTitle: "Исходник SwiftUI",
    sourceDescription:
      "Редактор принимает только SwiftUI. Включите структуру `View` и layout `body`.",
    sourceThemeDark: "Темный",
    sourceThemeLight: "Светлый",
    saveDraft: "Сохранить черновик",
    saveDraftPending: "Сохранение...",
    submitForReview: "Отправить на проверку",
    submitPending: "Отправка...",
  },
  upload: {
    title: "Скриншоты компонента",
    description:
      "Загрузите от 1 до {max} PNG, JPEG или WebP-превью. Эти изображения используются в карточках и на странице детали.",
    upload: "Загрузить",
    uploading: "Загрузка...",
    altText: "Alt-текст",
    removeScreenshot: "Удалить скриншот",
    removeScreenshotConfirm: "Удалить этот скриншот?",
    tooMany: "Можно загрузить не более {max} скриншотов.",
    uploadFailed: "Не удалось загрузить файл.",
  },
  share: {
    shareOnX: "Поделиться в X",
    linkedIn: "LinkedIn",
    reddit: "Reddit",
    share: "Поделиться",
    copyLink: "Скопировать ссылку",
    linkCopied: "Ссылка на компонент скопирована.",
    shareTextTemplate: "{title} в CopyMyUI",
  },
  favorite: {
    addAria: "Добавить в избранное",
    removeAria: "Убрать из избранного",
    updateFailed: "Не удалось обновить избранное.",
  },
  componentCard: {
    screenshotComingSoon: "Скриншот скоро появится",
    featured: "Избранное редакцией",
    premium: "Премиум",
    updatePending: "Обновление на проверке",
  },
  codeCopy: {
    button: "Копировать код",
    copied: "SwiftUI-код скопирован.",
    expand: "Показать код полностью",
    collapse: "Свернуть код",
    authRequiredTitle: "Войдите, чтобы скопировать",
    authRequiredDescription:
      "Продолжите через Google, чтобы скопировать SwiftUI-код и вернуться к компонентам.",
  },
  notFound: {
    eyebrow: "Не найдено",
    title: "Эта страница не найдена",
    description:
      "Запрошенный компонент или страница могут быть приватными, удалёнными или перемещёнными.",
    action: "На главную",
  },
  errors: {
    generic: "Что-то пошло не так.",
    formIncomplete: "Форма заполнена не полностью.",
    validation: {
      title: "Название должно содержать от 3 до 80 символов.",
      category: "Выберите категорию.",
      categoryList: "Выберите от 1 до 3 категорий.",
      name: "Название должно содержать от 2 до 40 символов.",
      slug: "Slug должен состоять из строчных букв, цифр или дефисов.",
      accent: "Стиль акцента должен содержать от 3 до 80 символов.",
      summary: "Краткое описание должно содержать от 20 до 160 символов.",
      description: "Описание должно содержать от 40 до 1400 символов.",
      changelog: "Список изменений должен быть не длиннее 400 символов.",
      sellerTargetPriceCents: "Укажите корректную сумму премиум-выплаты.",
      swiftCode: "SwiftUI-код должен содержать от 80 до 100000 символов.",
      screenshots: "Добавьте от 1 до 4 скриншотов.",
    },
    service: {
      swiftSourceRequired:
        "Нужен SwiftUI-код. Добавьте `import SwiftUI`, структуру `View` и реализацию `body`.",
      noPermission: "У вас нет прав на изменение этого компонента.",
      editDraftOnly: "Редактировать можно только черновые ревизии.",
      noEditableRevision: "У этого компонента нет редактируемой ревизии.",
      waitForModeration: "Дождитесь модерации, прежде чем начинать новое обновление.",
      submitDraftOnly: "Отправлять можно только черновые ревизии.",
      noActiveRevision: "Для этого компонента нет активной ревизии.",
      reviewPendingOnly: "Проверять можно только ревизии в статусе ожидания.",
      moderationNoteRequired: "Для отклонения компонента нужен комментарий модератора.",
      favoriteApprovedOnly: "Добавлять в избранное можно только одобренные компоненты.",
      purchaseApprovedPremiumOnly:
        "Покупать можно только одобренные премиум-компоненты.",
      ownComponentAccess: "У вас уже есть доступ к собственному компоненту.",
      markupPercentRange:
        "Процент наценки должен быть целым числом от 0 до 200.",
      categoryCountRange: "Выберите от 1 до 3 категорий.",
      primaryCategorySelection:
        "Основная категория должна входить в список выбранных категорий.",
      validCategories: "Выберите корректные категории.",
      apiKeyNotFound: "API-ключ не найден.",
    },
    api: {
      signInToFavorite: "Войдите, чтобы сохранять в избранное.",
      unableToFavorite: "Не удалось обновить избранное.",
      signInToUpload: "Необходимо войти в систему.",
      uploadCount: "Загрузите от 1 до {max} скриншотов.",
      uploadTypes: "Поддерживаются только PNG, JPEG и WebP.",
      uploadSize: "Размер каждого скриншота должен быть не больше 5 МБ.",
    },
  },
};

const de: typeof en = {
  app: {
    name: APP_NAME,
    description:
      "Eine kuratierte Bibliothek moderierter SwiftUI-Komponenten mit Code, Screenshots und Favoriten.",
  },
  languages: {
    en: "English",
    es: "Español",
    ru: "Русский",
    de: "Deutsch",
  },
  localeSwitcher: {
    label: "Sprache",
  },
  common: {
    signedIn: "Angemeldet",
    user: "Benutzer",
    owner: "Eigentümer",
    creator: "Ersteller",
    anonymousMaker: "Anonymer Ersteller",
    by: "von",
    version: "Fassung",
  },
  header: {
    explore: "Entdecken",
    dashboard: "Übersicht",
    moderation: "Prüfung",
    admin: "Verwaltung",
    settings: "Einstellungen",
    apiKeys: "API-Schlüssel",
    newComponent: "Neuer Baustein",
    favorites: "Favoriten",
    purchases: "Käufe",
    signOut: "Abmelden",
    signInWithGoogle: "Mit Google anmelden",
    menu: "Menü",
  },
  footer: {
    description:
      "Baue iOS-Screens schneller mit sofort einsetzbaren SwiftUI-Komponenten und produktionsreifem Code, damit du typische Screens nicht jedes Mal von Grund auf neu bauen musst.",
    exploreComponents: "Komponenten",
    creatorDashboard: "Creator-Dashboard",
    xLabel: "X / Web3Igor",
  },
  devSessions: {
    title: "Dev-Sitzungen",
    currentSession: "Aktuelle Sitzung:",
    signedOut: "abgemeldet",
    switchTo: "Wechseln zu {email}",
    clear: "Dev-Sitzung löschen",
  },
  status: {
    draft: "Entwurf",
    pendingReview: "Wartet auf Prüfung",
    approved: "Freigegeben",
    declined: "Abgelehnt",
  },
  categories: {
    navigation: {
      name: "Navigationsmuster",
      description: "Tab-Bars, Side-Rails, Pager und kompakte Navigationshüllen.",
    },
    dashboards: {
      name: "Übersichten",
      description: "Metriken, Karten, Verwaltungsansichten und analytische Layouts.",
    },
    commerce: {
      name: "Handel",
      description: "Preis-Flows, Produktkarten, Warenkörbe und Kaufoberflächen.",
    },
    paywall: {
      name: "Bezahlschranke",
      description: "Abo-Sperren, Upgrade-Hinweise und Flächen zur Monetarisierung.",
    },
    social: {
      name: "Soziales",
      description: "Profilmodule, soziale Timelines und Engagement-Widgets.",
    },
    forms: {
      name: "Formulare",
      description: "Mehrstufige Formulare, Auth-Screens und saubere Feldgruppen.",
    },
    media: {
      name: "Medien",
      description: "Galerien, Player, Karussells und bewegungsreiche Flächen.",
    },
    gaming: {
      name: "Spiele",
      description: "HUDs, Inventare, Quest-Abläufe und Gameplay-Overlays.",
    },
  },
  home: {
    title: "Baue deine SwiftUI-Bibliothek.",
    description:
      "Liefere schneller mit sofort einsetzbaren SwiftUI-Komponenten und produktionsreifem Code, damit du häufige Ansichten nicht immer wieder von Grund auf bauen musst.",
    searchPlaceholder: "Suche nach Titeln, Beschreibungen, Erstellern und Dashboards...",
    exploreComponents: "Komponenten entdecken",
    topRatedNow: "Derzeit meistgespeichert",
    freshlyApproved: "Frisch hinzugefügt",
    openComponent: "Komponente öffnen",
    topRatedEyebrow: "Meistgespeichert",
    topRatedTitle: "Favoritenwürdige Bausteine",
    browseEveryComponent: "Alle ansehen",
    categoryLeadersEyebrow: "Kategorie-Favoriten",
    categoryLeadersTitle: "Ein starkes Beispiel pro Bereich",
    premiumEyebrow: "Premium-Auswahl",
    premiumTitle: "Kuratiert premium Komponenten",
    browsePremium: "Premium ansehen",
    newestEyebrow: "Neueste Veröffentlichungen",
    newestTitle: "Kürzlich für die Galerie freigegeben",
  },
  explorePage: {
    eyebrow: "Entdecken",
    title: "Öffentliche SwiftUI-Komponenten",
    description:
      "Suche freigegebene Einreichungen, springe zwischen Kategorien und speichere Favoriten für später.",
    searchPlaceholder: "Nach Titel oder Autor suchen",
    allCategories: "Alle Kategorien",
    allAccessTypes: "Alle Zugriffstypen",
    freeOnly: "Nur kostenlos",
    premiumOnly: "Nur Premium",
    topRated: "Meistgespeichert",
    newest: "Neueste",
    updateFilters: "Filter aktualisieren",
    emptyEyebrow: "Keine Ergebnisse",
    emptyTitle: "Keine Komponenten passen zu diesen Filtern",
    emptyDescription:
      "Versuche den Kategorienfilter zu entfernen oder den Suchbegriff zu erweitern. Freigegebene Komponenten erscheinen hier automatisch nach der Moderation.",
    resetFilters: "Filter zurücksetzen",
  },
  detailPage: {
    newRevisionPendingReview: "Neue Revision wartet auf Freigabe",
    privatePreview: "Private Vorschau für Moderator/Eigentümer",
    editCurrentDraft: "Aktuellen Entwurf bearbeiten",
    startUpdateDraft: "Update-Entwurf starten",
    premiumBadge: "Kostenpflichtig",
    premiumEyebrow: "Premium-Zugang",
    premiumTitle: "SwiftUI-Quellcode freischalten",
    premiumUnlockedDescription:
      "Du hast bereits Zugriff auf den Quellcode dieser Premium-Komponente.",
    premiumLockedDescription:
      "Diese Premium-Komponente zeigt die Screenshots öffentlich, der SwiftUI-Code wird aber erst nach dem Kauf freigeschaltet.",
    buyerPrice: "Preis",
    swiftSourceEyebrow: "SwiftUI-Quellcode",
    swiftSourceTitle: "Fertiger Code",
    lockedSourcePreviewLabel: "Teilweise Codevorschau",
    lockedSourceTitle: "Quellcode bis zum Kauf verborgen",
    lockedSourceDescription:
      "Öffentliche Besucher können Screenshots und Überblick sehen. Kaufe diese Komponente, um den vollständigen SwiftUI-Code auf dieser Seite freizuschalten.",
    buyNowLabel: "Jetzt kaufen",
    signInToBuy: "Zum Kaufen anmelden",
    revisionTrailEyebrow: "Letzte Freigabe",
    revisionTrailTitle: "Letztes Update",
    needMoreEyebrow: "Mehr Komponenten gesucht?",
    needMoreTitle: "Die vollständige öffentliche Sammlung erkunden",
    needMoreDescription:
      "Durchstöbere weitere freigegebene Komponenten aus allen Kategorien und behalte deine Favoriten griffbereit.",
    exploreAllComponents: "Alle Komponenten erkunden",
  },
  dashboardPage: {
    noticeSubmitted: "Deine Revision wurde zur Prüfung an die Moderatoren gesendet.",
    eyebrow: "Creator-Dashboard",
    title: "Verwalte deine Einreichungen",
    description:
      "Erstelle Entwürfe, sende Updates erneut ein und verfolge, was Moderatoren freigegeben oder abgelehnt haben.",
    continueEditing: "Weiter bearbeiten",
    startUpdate: "Update starten",
    reviseDraft: "Entwurf überarbeiten",
    premiumBadge: "Kostenpflichtig",
    viewComponent: "Komponente ansehen",
    emptyEyebrow: "Loslegen",
    emptyTitle: "Noch keine Komponenten",
    emptyDescription:
      "Erstelle deinen ersten SwiftUI-Baustein, lade Screenshots hoch und entscheide, wann er für die Moderation bereit ist.",
    emptyAction: "Erste Komponente erstellen",
  },
  newComponentPage: {
    noticeSaved: "Entwurf gespeichert. Verfeinere ihn in Ruhe weiter.",
    eyebrow: "Neue Komponente",
    title: "Neue Komponenten-Veröffentlichung erstellen",
    description:
      "Lege eine neue Komponenten-Veröffentlichung an, lade Screenshots hoch und reiche sie ein, sobald sie bereit für die Moderation ist.",
  },
  editComponentPage: {
    noticeSaved: "Entwurf gespeichert. Reiche ihn ein, sobald Moderatoren das Update prüfen sollen.",
    eyebrow: "Entwurf bearbeiten",
    description:
      "Freigegebene Revisionen bleiben gesperrt. Dieser Entwurf ist die einzige bearbeitbare Version, bis du ihn erneut einreichst.",
  },
  favoritesPage: {
    eyebrow: "Gespeicherte Sammlung",
    title: "Deine Favoriten",
    description:
      "Behalte deine nützlichsten SwiftUI-Referenzen in Reichweite und greife darauf zurück, wenn du einen Ausgangspunkt brauchst.",
    emptyEyebrow: "Noch keine Favoriten",
    emptyTitle: "Du hast noch keine Komponenten gespeichert",
    emptyDescription:
      "Durchstöbere die öffentliche Galerie und tippe auf das Herz bei allem, was du in deiner persönlichen Sammlung behalten möchtest.",
    emptyAction: "Komponenten entdecken",
  },
  purchasesPage: {
    noticePurchased:
      "Premium-Komponente freigeschaltet. Der SwiftUI-Quellcode ist jetzt verfügbar.",
    eyebrow: "Freigeschaltete Bibliothek",
    title: "Deine Premium-Käufe",
    description:
      "Alles, was du freigeschaltet hast, bleibt hier verfügbar, damit du jederzeit zu bezahlten SwiftUI-Komponenten zurückkehren kannst.",
    emptyEyebrow: "Noch keine Käufe",
    emptyTitle: "Noch keine Premium-Käufe",
    emptyDescription:
      "Erkunde den Premium-Katalog, schalte die gewünschten Komponenten frei und behalte sie dauerhaft in dieser Bibliothek.",
    emptyAction: "Premium-Komponenten ansehen",
  },
  profilePage: {
    defaultName: "Ersteller",
    eyebrow: "Erstellerprofil",
    description:
      "Öffentliche freigegebene Komponenten dieses Erstellers. Kostenlose Releases und Premium-Drops bleiben hier ohne Anmeldung sichtbar.",
    componentCount: "Freigegebene Komponenten",
    premiumCount: "Premium-Komponenten",
    freeSectionEyebrow: "Geteilte kostenlose Komponenten",
    freeSectionTitle: "Veröffentlichungen",
    premiumSectionEyebrow: "Premium-Komponenten",
    premiumSectionTitle: "Freigegebene Premium-Releases",
  },
  categoryPage: {
    eyebrow: "Kategoriesammlung",
    approvedCount: "Komponenten gesamt",
    paginationPrevious: "Zurück",
    paginationNext: "Weiter",
    paginationPage: "Seite",
    premiumCount: "Kostenpflichtig",
    featuredCount: "Empfohlen",
    paywallEyebrow: "Kategorie-Paywall",
    paywallTitle: "Premium-Komponenten in dieser Kategorie",
    paywallDescription:
      "Diese Komponenten sind in der öffentlichen Galerie nur als Screenshots sichtbar. Kaufe eine, um den SwiftUI-Quellcode freizuschalten.",
    paywallAction: "Kategorie-Premium ansehen",
    emptyEyebrow: "Noch keine freigegebenen Komponenten",
    emptyTitle: "Diese Kategorie füllt sich noch",
    emptyDescription:
      "Freigegebene Komponenten mit dieser Kategorie erscheinen hier automatisch nach der Moderation.",
    emptyAction: "Alle Komponenten ansehen",
  },
  adminPage: {
    noticeUpdated: "Marketplace-Aufschlag aktualisiert.",
    noticeCategoryUpdated: "Kategorieeinstellungen aktualisiert.",
    eyebrow: "Admin-Steuerung",
    title: "Premium-Marketplace-Einstellungen verwalten",
    description:
      "Passe den Marketplace-Aufschlag an, prüfe das Premium-Inventar und verfolge aktuelle Premium-Käufe.",
    markupLabel: "Prozentualer Plattform-Aufschlag",
    markupHint:
      "Ersteller legen die Auszahlung fest, die sie erhalten möchten. Dieser Aufschlag wird für den finalen Käuferpreis oben drauf gerechnet.",
    saveMarkup: "Aufschlag speichern",
    salesCount: "Anzahl Verkäufe",
    grossRevenue: "Bruttoumsatz",
    platformFees: "Plattformgebühren",
    categorySectionEyebrow: "Kategorie-Steuerung",
    categorySectionTitle: "Kategorie-Metadaten bearbeiten",
    categoryNameLabel: "Kategoriename",
    categorySlugLabel: "Kategorie-Slug",
    categoryAccentLabel: "Akzentstil",
    categoryDescriptionLabel: "Standardbeschreibung auf Englisch",
    categoryUsageLabel: "Zugewiesene Komponenten:",
    saveCategory: "Kategorie speichern",
    premiumSectionEyebrow: "Premium-Katalog",
    premiumSectionTitle: "Freigegebene Premium-Komponenten",
    recentSalesEyebrow: "Letzte Verkäufe",
    recentSalesTitle: "Neueste Premium-Käufe",
    feeLabel: "Gebühr:",
  },
  apiKeys: {
    title: "API-Schlüssel",
    description:
      "Erstelle persönliche API-Schlüssel, um den Katalog zu durchsuchen, deine Favoriten zu lesen und optional Premium-Käufe aus Skripten oder externen Tools auszulösen.",
    nameLabel: "Schlüsselname",
    namePlaceholder: "Lokale Automatisierung",
    purchaseScopeLabel: "Premium-Käufe erlauben",
    create: "Schlüssel erstellen",
    save: "Schlüssel speichern",
    delete: "Schlüssel löschen",
    createdNotice: "API-Schlüssel `{name}` erstellt.",
    createdHint:
      "Kopiere diesen Schlüssel jetzt. Aus Sicherheitsgründen wird der vollständige Wert nur einmal angezeigt.",
    fallbackName: "Unbenannter Schlüssel",
    lastUsedLabel: "Zuletzt verwendet:",
    neverUsed: "Noch nie verwendet",
    createdLabel: "Erstellt:",
    empty: "Du hast noch keine API-Schlüssel erstellt.",
    updatedNotice: "API-Schlüssel aktualisiert.",
    deletedNotice: "API-Schlüssel gelöscht.",
    genericError: "API-Schlüssel konnten nicht aktualisiert werden.",
  },
  moderationPage: {
    noticeApproved: "Die Revision wurde freigegeben und in die öffentliche Galerie übernommen.",
    noticeDeclined: "Die Revision wurde abgelehnt. Der Ersteller kann sie überarbeiten und erneut einreichen.",
    eyebrow: "Moderationswarteschlange",
    title: "Ausstehende Einreichungen prüfen",
    description:
      "Gib öffentliche Releases frei oder lehne sie mit klaren Hinweisen ab, damit Ersteller sie überarbeiten und erneut einreichen können.",
    pendingRevision: "Ausstehende Revision",
    currentPublicVersion: "Aktuelle öffentliche Version",
    revisionHistory: "Revisionsverlauf",
    queueClearEyebrow: "Warteschlange leer",
    queueClearTitle: "Es gibt keine ausstehenden Revisionen",
    queueClearDescription:
      "Ersteller haben entweder private Entwürfe gespeichert oder Moderatoren haben die aktuelle Warteschlange bereits bearbeitet.",
  },
  moderationForm: {
    noteRequired: "Zum Ablehnen einer Komponente ist eine Moderator-Notiz erforderlich.",
    noteLabel: "Moderator-Notiz",
    primaryCategory: "Primäre Kategorie",
    relatedCategories: "Zugewiesene Kategorien",
    categoryHint:
      "Wähle bis zu 3 Kategorien. Die primäre Kategorie muss ausgewählt bleiben.",
    categorySelectionRequired:
      "Wähle vor der Freigabe zwischen 1 und 3 Kategorien aus.",
    notePlaceholder:
      "Erkläre die Entscheidung, besonders wenn du das Update ablehnst.",
    approve: "Revision freigeben",
    decline: "Revision ablehnen",
  },
  signInPage: {
    eyebrow: "Dem Creator-Workflow beitreten",
    title: "Mit Google anmelden.",
    description:
      "Arbeite privat, reiche polierte SwiftUI-Komponenten ein und verfolge die Moderation aus einem zentralen Dashboard.",
    bulletPrivateDrafts:
      "Private Entwürfe und Revisionsverlauf, bevor irgendetwas öffentlich wird.",
    bulletScreenshots:
      "Pflicht-Screenshots und Validierung ausschließlich für SwiftUI-Code.",
    bulletVoting:
      "Favoriten und Moderator-Freigabe nach jedem Update.",
    authConfigured:
      "Nutze dein Google-Konto, um Komponenten zu erstellen, zu favorisieren und zu moderieren.",
    authNotConfigured:
      "Die Google-Auth-Zugangsdaten sind lokal noch nicht konfiguriert, daher bleibt die Google-Anmeldung deaktiviert, bis sie eingerichtet sind.",
    continueWithGoogle: "Mit Google anmelden",
    devShortcuts: "Entwicklungs-Shortcuts",
    signInAs: "Anmelden als {email}",
  },
  editor: {
    title: "SwiftUI-Komponente",
    description:
      "Arbeite privat, speichere Revisionen und veröffentliche erst nach Freigabe durch die Moderation.",
    componentTitle: "Komponententitel",
    componentTitlePlaceholder: "Aurora-Orbit",
    primaryCategory: "Primäre Kategorie",
    primaryCategoryPlaceholder: "Kategorie auswählen",
    relatedCategories: "Verwandte Kategorien",
    categoryHint:
      "Wähle insgesamt bis zu 3 Kategorien. Die primäre Kategorie ist die wichtigste Browsing-Spur.",
    categoryLockedHint:
      "Bei freigegebenen Komponenten bleiben Kategorien gesperrt, bis ein Moderator die nächste Revision prüft.",
    primaryCategorySelected: "Primäre Kategorie",
    relatedCategoryOption: "Optionale verwandte Kategorie",
    summary: "Kurztext",
    summaryHint: "Kurzer Kartentext für Listenansichten (20-160 Zeichen).",
    descriptionLabel: "Beschreibung",
    changelog: "Änderungen",
    monetizationTitle: "Monetarisierung",
    monetizationDescription:
      "Lege fest, ob diese Revision kostenlos oder Premium ist. Premium-Listings bleiben als Screenshots öffentlich, bis jemand den Quellcode kauft.",
    freeOption: "Kostenlos",
    freeOptionDescription:
      "Jeder kann die öffentliche Seite öffnen und nach der Freigabe den SwiftUI-Code kopieren.",
    premiumOption: "Kostenpflichtig",
    premiumOptionDescription:
      "Zeige Screenshots öffentlich und verberge den SwiftUI-Code bis zum Kauf.",
    sellerTargetPrice: "Gewünschte Auszahlung (USD)",
    sellerTargetPriceHint:
      "Lege den Betrag fest, den du erhalten möchtest. Der Plattform-Aufschlag wird im Marketplace oben drauf addiert.",
    screenshotsTitle: "Vorschauen",
    screenshotsDescription:
      "Lade helle Vorschauen hoch, die den fertigen Zustand der Komponente zeigen.",
    sourceTitle: "SwiftUI-Quellcode",
    sourceDescription:
      "Der Editor akzeptiert nur SwiftUI. Füge eine `View`-Struktur und das `body`-Layout hinzu.",
    sourceThemeDark: "Dunkel",
    sourceThemeLight: "Hell",
    saveDraft: "Entwurf speichern",
    saveDraftPending: "Entwurf wird gespeichert...",
    submitForReview: "Zur Prüfung einreichen",
    submitPending: "Wird eingereicht...",
  },
  upload: {
    title: "Komponenten-Screenshots",
    description:
      "Lade 1 bis {max} PNG-, JPEG- oder WebP-Vorschauen hoch. Diese Bilder steuern Kartenraster und Detailseite.",
    upload: "Hochladen",
    uploading: "Wird hochgeladen...",
    altText: "Alt-Text",
    removeScreenshot: "Screenshot entfernen",
    removeScreenshotConfirm: "Diesen Screenshot entfernen?",
    tooMany: "Du kannst bis zu {max} Screenshots hochladen.",
    uploadFailed: "Upload fehlgeschlagen.",
  },
  share: {
    shareOnX: "Auf X teilen",
    linkedIn: "LinkedIn",
    reddit: "Reddit",
    share: "Teilen",
    copyLink: "Link kopieren",
    linkCopied: "Komponenten-Link kopiert.",
    shareTextTemplate: "{title} auf CopyMyUI",
  },
  favorite: {
    addAria: "Zu Favoriten hinzufügen",
    removeAria: "Aus Favoriten entfernen",
    updateFailed: "Favorit konnte nicht aktualisiert werden.",
  },
  componentCard: {
    screenshotComingSoon: "Screenshot folgt in Kürze",
    featured: "Empfohlen",
    premium: "Kostenpflichtig",
    updatePending: "Update ausstehend",
  },
  codeCopy: {
    button: "Code kopieren",
    copied: "SwiftUI-Code kopiert.",
    expand: "Vollständigen Code anzeigen",
    collapse: "Code einklappen",
    authRequiredTitle: "Zum Kopieren anmelden",
    authRequiredDescription:
      "Fahre mit Google fort, um den SwiftUI-Code zu kopieren und zu den Komponenten zurückzukehren.",
  },
  notFound: {
    eyebrow: "Nicht gefunden",
    title: "Diese Seite konnte nicht gefunden werden",
    description:
      "Die angeforderte Komponente oder Seite ist möglicherweise privat, fehlt oder wurde verschoben.",
    action: "Zur Startseite",
  },
  errors: {
    generic: "Etwas ist schiefgelaufen.",
    formIncomplete: "Das Formular ist unvollständig.",
    validation: {
      title: "Der Titel muss zwischen 3 und 80 Zeichen lang sein.",
      category: "Wähle eine Kategorie aus.",
      categoryList: "Wähle zwischen 1 und 3 Kategorien.",
      name: "Der Name muss zwischen 2 und 40 Zeichen lang sein.",
      slug: "Der Slug darf nur Kleinbuchstaben, Zahlen oder Bindestriche enthalten.",
      accent: "Der Akzentstil muss zwischen 3 und 80 Zeichen lang sein.",
      summary: "Der Kurztext muss zwischen 20 und 160 Zeichen lang sein.",
      description: "Die Beschreibung muss zwischen 40 und 1400 Zeichen lang sein.",
      changelog: "Das Changelog darf höchstens 400 Zeichen haben.",
      sellerTargetPriceCents: "Lege einen gültigen Premium-Auszahlungsbetrag fest.",
      swiftCode: "Der SwiftUI-Code muss zwischen 80 und 100000 Zeichen lang sein.",
      screenshots: "Füge zwischen 1 und 4 Screenshots hinzu.",
    },
    service: {
      swiftSourceRequired:
        "SwiftUI-Code ist erforderlich. Füge `import SwiftUI`, eine `View`-Struktur und eine `body`-Implementierung hinzu.",
      noPermission: "Du hast keine Berechtigung, diese Komponente zu ändern.",
      editDraftOnly: "Nur Entwurfs-Revisionen können bearbeitet werden.",
      noEditableRevision: "Diese Komponente hat keine bearbeitbare Revision.",
      waitForModeration: "Warte auf die Moderation, bevor du ein weiteres Update startest.",
      submitDraftOnly: "Nur Entwurfs-Revisionen können eingereicht werden.",
      noActiveRevision: "Für diese Komponente existiert keine aktive Revision.",
      reviewPendingOnly: "Nur ausstehende Revisionen können geprüft werden.",
      moderationNoteRequired:
        "Zum Ablehnen einer Komponente ist eine Moderator-Notiz erforderlich.",
      favoriteApprovedOnly: "Nur freigegebene Komponenten können favorisiert werden.",
      purchaseApprovedPremiumOnly:
        "Nur freigegebene Premium-Komponenten können gekauft werden.",
      ownComponentAccess:
        "Du hast bereits Zugriff auf deine eigene Komponente.",
      markupPercentRange:
        "Der Aufschlag muss eine ganze Zahl zwischen 0 und 200 sein.",
      categoryCountRange: "Wähle zwischen 1 und 3 Kategorien.",
      primaryCategorySelection:
        "Die primäre Kategorie muss Teil der ausgewählten Kategorien sein.",
      validCategories: "Wähle gültige Kategorien aus.",
      apiKeyNotFound: "API-Schlüssel nicht gefunden.",
    },
    api: {
      signInToFavorite: "Melde dich an, um Favoriten zu speichern.",
      unableToFavorite: "Favorit konnte nicht aktualisiert werden.",
      signInToUpload: "Du musst angemeldet sein.",
      uploadCount: "Lade zwischen 1 und {max} Screenshots hoch.",
      uploadTypes: "Nur PNG-, JPEG- und WebP-Screenshots werden unterstützt.",
      uploadSize: "Jeder Screenshot muss 5 MB oder kleiner sein.",
    },
  },
};

export type Messages = typeof en;

export const messagesByLocale: Record<AppLocale, Messages> = {
  en,
  es,
  ru,
  de,
};

export function getMessagesForLocale(locale: AppLocale) {
  return messagesByLocale[locale];
}
