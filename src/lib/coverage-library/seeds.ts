import type { ProfileSeed } from "./build-profile";

/** Curated PolicyWell coverage-library seeds (original copy; not third-party standards). */
export const PROFILE_SEEDS: ProfileSeed[] = [
  {
    slug: "metal-fabrication-shops",
    name: "Metal Fabrication Shops",
    industry: "Manufacturing",
    assetTypes: ["Machine shop", "Fabrication plant", "Storage yard"],
    completionScore: 94,
    focusLines: [
      "Property",
      "Business Income",
      "General Liability",
      "Commercial Auto",
      "Workers' Compensation",
      "Umbrella / Excess",
      "Inland Marine",
      "Crime",
    ],
    summary:
      "Benchmark for light-industrial metal fabrication — property at replacement cost, liability for premises and products, and inland marine for tools and work in process.",
    advisoryLead:
      "Underinsured buildings and missing inland marine on customer property in care, custody, or control are the gaps that most often surface at claim time.",
    advisoryPoints: [
      "Reconcile building and business personal property values to current replacement cost each renewal.",
      "Confirm inland marine or bailee wording for customer materials and finished goods off-site.",
      "Review hot-work and contractor controls where tenants or vendors cut and weld on premises.",
    ],
    relatedSlugs: ["contractors-general", "industrial-equipment-distributors"],
  },
  {
    slug: "architecture-engineering-firms",
    name: "Architecture & Engineering Firms",
    industry: "Professional & Business Services",
    assetTypes: ["Architect", "Engineer", "Commercial office"],
    completionScore: 96,
    focusLines: [
      "Professional Liability",
      "General Liability",
      "Commercial Auto",
      "Workers' Compensation",
      "Cyber",
      "Umbrella / Excess",
      "Property",
      "Crime",
    ],
    summary:
      "Design professionals need professional liability sized to revenue and project contracts, plus the liability and auto floor owners and lenders typically require.",
    advisoryLead:
      "Latent design claims and contractual indemnity mismatches are the defining exposures for A&E practices.",
    advisoryPoints: [
      "Keep the E&O retroactive date continuous with the firm's service history and buy tail before a carrier change.",
      "Match contractual liability endorsements to owner indemnity language before work starts.",
      "Evaluate cyber coverage for project models, drawings, and client data E&O usually excludes.",
    ],
    relatedSlugs: [
      "accounting-tax-preparation-practices",
      "advertising-marketing-agencies",
      "technology-saas-companies",
    ],
  },
  {
    slug: "accounting-tax-preparation-practices",
    name: "Accounting & Tax Preparation Practices",
    industry: "Professional & Business Services",
    assetTypes: ["CPA firm", "Tax practice", "Bookkeeping office"],
    completionScore: 88,
    focusLines: [
      "Professional Liability",
      "Cyber",
      "General Liability",
      "Property",
      "Crime",
      "Workers' Compensation",
    ],
    summary:
      "Client-data density and filing-season errors drive the need for professional liability and cyber as co-equal foundations.",
    advisoryLead:
      "Cyber and E&O often leave a seam around social-engineering loss and prior-acts disputes.",
    advisoryPoints: [
      "Confirm crime or social-engineering coverage for wire-fraud instructions impersonating clients.",
      "Align E&O retro dates with the earliest year of continuous practice.",
      "Document client engagement letters so scope matches the professional liability form.",
    ],
    relatedSlugs: ["architecture-engineering-firms", "technology-saas-companies"],
  },
  {
    slug: "advertising-marketing-agencies",
    name: "Advertising & Marketing Agencies",
    industry: "Professional & Business Services",
    assetTypes: ["Agency office", "Studio"],
    completionScore: 84,
    focusLines: [
      "Professional Liability",
      "Cyber",
      "General Liability",
      "Property",
      "Commercial Auto",
      "Workers' Compensation",
    ],
    summary:
      "Agencies combine media errors & omissions, intellectual-property risk, and cyber exposure from client creative files and ad platforms.",
    advisoryLead:
      "IP infringement and media exclusions inside generic E&O forms are the usual blind spots.",
    advisoryPoints: [
      "Prefer media / advertising liability wording for content and campaign work.",
      "Review cyber for production files and client PII held in project tools.",
      "Check hired and non-owned auto when staff travel to shoots and client sites.",
    ],
    relatedSlugs: [
      "architecture-engineering-firms",
      "technology-saas-companies",
    ],
  },
  {
    slug: "technology-saas-companies",
    name: "Technology & SaaS Companies",
    industry: "Technology",
    assetTypes: ["SaaS operator", "Software studio", "Dev office"],
    completionScore: 91,
    focusLines: [
      "Cyber",
      "Professional Liability",
      "General Liability",
      "Property",
      "Workers' Compensation",
      "Umbrella / Excess",
      "Crime",
    ],
    summary:
      "SaaS and software firms need tech E&O and cyber sized to contract and data obligations, with property and liability for office operations.",
    advisoryLead:
      "Contractual liability caps and silent cyber on property forms leave residual breach and downtime risk.",
    advisoryPoints: [
      "Map tech E&O and cyber so downtime, breach response, and professional negligence do not fall between policies.",
      "Review customer MSA indemnity against policy contractual liability limitations.",
      "Confirm crime coverage for social-engineering and funds-transfer fraud.",
    ],
    relatedSlugs: [
      "advertising-marketing-agencies",
      "accounting-tax-preparation-practices",
    ],
  },
  {
    slug: "homeowners-association-management",
    name: "Homeowners' Association Management",
    industry: "Home Owner's Associations",
    assetTypes: ["Townhouse / row", "HOA common elements", "Clubhouse"],
    completionScore: 100,
    focusLines: [
      "Property",
      "General Liability",
      "Umbrella / Excess",
      "Workers' Compensation",
      "Crime",
      "Business Income",
      "Cyber",
    ],
    summary:
      "Association programs need shared-property values, board and crime protection, and liability that contemplates amenities and vendor contracts.",
    advisoryLead:
      "Stale property schedules and thin D&O / crime limits are the most common association shortfalls.",
    advisoryPoints: [
      "Update building and amenity values to current replacement cost before renewal.",
      "Confirm crime coverage for association funds and management-company access.",
      "Align master policy boundaries with unit-owner HO-6 expectations in governing documents.",
    ],
    relatedSlugs: [
      "condominium-association",
      "community-association-management",
      "multifamily-property-management",
    ],
  },
  {
    slug: "condominium-association",
    name: "Condominium Association",
    industry: "Home Owner's Associations",
    assetTypes: ["Condominium building", "Common elements"],
    completionScore: 97,
    focusLines: [
      "Property",
      "General Liability",
      "Umbrella / Excess",
      "Crime",
      "Workers' Compensation",
      "Business Income",
    ],
    summary:
      "Condo masters must define walls-in vs walls-out clearly and carry liability and crime that protect the association and board.",
    advisoryLead:
      "Ordinance or law and underinsured towers drive assessment risk after a partial loss.",
    advisoryPoints: [
      "Verify ordinance or law A/B/C limits against local rebuild requirements.",
      "Reconcile master vs unit-owner coverage boundaries in the declaration.",
      "Review water-damage deductibles and how assessments are allocated to owners.",
    ],
    relatedSlugs: [
      "homeowners-association-management",
      "community-association-management",
    ],
  },
  {
    slug: "community-association-management",
    name: "Community Association Management",
    industry: "Home Owner's Associations",
    assetTypes: ["Management company", "Planned unit development"],
    completionScore: 93,
    focusLines: [
      "Professional Liability",
      "General Liability",
      "Cyber",
      "Crime",
      "Commercial Auto",
      "Workers' Compensation",
    ],
    summary:
      "Management companies need E&O for association advice and administration, plus crime and cyber for funds and owner data.",
    advisoryLead:
      "Third-party crime and management E&O exclusions for dishonest acts need careful reading.",
    advisoryPoints: [
      "Confirm crime covers employee and non-employee theft of association funds.",
      "Align E&O with the management agreement's duty of care.",
      "Add cyber for owner PII and portal credentials.",
    ],
    relatedSlugs: [
      "homeowners-association-management",
      "multifamily-property-management",
    ],
  },
  {
    slug: "multifamily-property-management",
    name: "Multifamily Property Management",
    industry: "Property Management",
    assetTypes: ["Multifamily", "Garden apartments", "Leased real estate"],
    completionScore: 98,
    focusLines: [
      "Property",
      "General Liability",
      "Umbrella / Excess",
      "Workers' Compensation",
      "Commercial Auto",
      "Crime",
      "Business Income",
    ],
    summary:
      "Multifamily operators need habitational liability, property at RCV, and business income that contemplates unit downtime after a loss.",
    advisoryLead:
      "Assault & battery, habitability, and valuation gaps are the exposures that most often underperform at claim time.",
    advisoryPoints: [
      "Confirm assault & battery and animal-liability treatment on the GL form.",
      "Keep SOV values current and consistent with lender requirements.",
      "Review ordinance or law for older garden and mid-rise stock.",
    ],
    relatedSlugs: [
      "residential-property-management",
      "commercial-property-management",
      "assisted-living",
    ],
  },
  {
    slug: "residential-property-management",
    name: "Residential Property Management",
    industry: "Property Management",
    assetTypes: ["Single-family rental portfolio", "Small multifamily"],
    completionScore: 90,
    focusLines: [
      "Property",
      "General Liability",
      "Umbrella / Excess",
      "Workers' Compensation",
      "Commercial Auto",
      "Crime",
    ],
    summary:
      "Portfolios of leased homes need scalable property schedules, liability for tenant injuries, and auto for maintenance fleets.",
    advisoryLead:
      "Tenant discrimination and vacant-home conditions are frequent silent gaps.",
    advisoryPoints: [
      "Check habitational GL for discrimination and personal-injury coverage.",
      "Document vacancy and renovation conditions that change underwriting.",
      "Align contractor agreements with additional-insured requirements.",
    ],
    relatedSlugs: [
      "multifamily-property-management",
      "short-term-rental-management",
    ],
  },
  {
    slug: "commercial-property-management",
    name: "Commercial Property Management",
    industry: "Property Management",
    assetTypes: ["Office", "Retail center", "Industrial park"],
    completionScore: 92,
    focusLines: [
      "Property",
      "General Liability",
      "Umbrella / Excess",
      "Workers' Compensation",
      "Commercial Auto",
      "Business Income",
    ],
    summary:
      "Commercial managers need blanket or scheduled property, premises liability, and income protection tied to lease structures.",
    advisoryLead:
      "Tenant improvements and landlord legal liability often sit outside a thin master schedule.",
    advisoryPoints: [
      "Clarify TI / betterments ownership between landlord and tenant policies.",
      "Review lease insurance exhibits against the master program annually.",
      "Confirm pollution and mold treatment for older retail and industrial assets.",
    ],
    relatedSlugs: [
      "multifamily-property-management",
      "retail-storefronts",
    ],
  },
  {
    slug: "short-term-rental-management",
    name: "Short-Term Rental Management",
    industry: "Property Management",
    assetTypes: ["STR portfolio", "Vacation rental"],
    completionScore: 86,
    focusLines: [
      "Property",
      "General Liability",
      "Umbrella / Excess",
      "Cyber",
      "Commercial Auto",
      "Crime",
    ],
    summary:
      "Short-term rental managers need habitational liability that contemplates transient occupancy and platform contracts.",
    advisoryLead:
      "Homeowner forms and silent STR exclusions are the primary placement traps.",
    advisoryPoints: [
      "Confirm the property form expressly permits short-term rental occupancy.",
      "Review host / platform liability interfaces so guest injury claims have a clear respondent.",
      "Add cyber for guest identity data and booking systems.",
    ],
    relatedSlugs: [
      "residential-property-management",
      "bed-breakfast-lodging",
    ],
  },
  {
    slug: "assisted-living",
    name: "Assisted Living",
    industry: "Healthcare & Social Assistance",
    assetTypes: ["Assisted living"],
    completionScore: 95,
    focusLines: [
      "Property",
      "Business Income",
      "General Liability",
      "Professional Liability",
      "Workers' Compensation",
      "Umbrella / Excess",
      "Builders Risk",
    ],
    summary:
      "Senior-care assets need professional liability and abuse capacity alongside a disciplined property and business-income floor.",
    advisoryLead:
      "Professional liability and abuse coverage are the exposures most likely to be underbuilt.",
    advisoryPoints: [
      "Verify abuse and molestation limits approach the general liability limit rather than a token sublimit.",
      "Confirm business income contemplates resident relocation and extra expense.",
      "Reconcile property valuations to current replacement cost to avoid coinsurance gaps.",
    ],
    relatedSlugs: [
      "skilled-nursing-facilities",
      "independent-living",
      "multifamily-property-management",
    ],
  },
  {
    slug: "skilled-nursing-facilities",
    name: "Skilled Nursing Facilities",
    industry: "Healthcare & Social Assistance",
    assetTypes: ["Skilled nursing"],
    completionScore: 98,
    focusLines: [
      "Property",
      "Business Income",
      "General Liability",
      "Professional Liability",
      "Workers' Compensation",
      "Umbrella / Excess",
      "Cyber",
    ],
    summary:
      "SNFs combine medical professional liability, habitational property risk, and workforce injury exposure in one operating profile.",
    advisoryLead:
      "Claims-made professional liability and thin cyber for PHI are recurring diligence findings.",
    advisoryPoints: [
      "Map professional liability retro dates to the facility's continuous operations.",
      "Confirm elopement, falls, and pressure-injury treatment on the liability form.",
      "Add cyber sized to electronic health records and payment data.",
    ],
    relatedSlugs: ["assisted-living", "independent-living"],
  },
  {
    slug: "independent-living",
    name: "Independent Living",
    industry: "Healthcare & Social Assistance",
    assetTypes: ["Independent living", "Senior apartments"],
    completionScore: 94,
    focusLines: [
      "Property",
      "General Liability",
      "Umbrella / Excess",
      "Workers' Compensation",
      "Business Income",
      "Crime",
    ],
    summary:
      "Independent living sits between multifamily habitational and senior care — property and liability first, with lighter clinical professional exposure.",
    advisoryLead:
      "Amenity liability and aging building systems drive frequency as populations age in place.",
    advisoryPoints: [
      "Review slip-and-fall and amenity controls on the GL schedule.",
      "Confirm ordinance or law for mid-century senior housing stock.",
      "Document when services cross into assisted-living professional liability territory.",
    ],
    relatedSlugs: ["assisted-living", "multifamily-property-management"],
  },
  {
    slug: "restaurants-full-service",
    name: "Full-Service Restaurants",
    industry: "Restaurant",
    assetTypes: ["Restaurant", "Bar seating"],
    completionScore: 89,
    focusLines: [
      "Property",
      "General Liability",
      "Commercial Auto",
      "Workers' Compensation",
      "Umbrella / Excess",
      "Business Income",
      "Crime",
    ],
    summary:
      "Restaurants need food-borne illness and liquor considerations on liability, plus property and income protection for kitchen-driven losses.",
    advisoryLead:
      "Liquor liability, spoilage, and equipment breakdown are the lines most often left thin.",
    advisoryPoints: [
      "Confirm liquor liability where alcohol is served, including third-party overserve claims.",
      "Add equipment breakdown and spoilage for cold storage and cooking equipment.",
      "Review delivery and hired auto when using employee or contracted drivers.",
    ],
    relatedSlugs: [
      "fast-food-qsr",
      "bars-lounges-nightclubs",
      "catering-operations",
    ],
  },
  {
    slug: "fast-food-qsr",
    name: "Fast Food & QSR",
    industry: "Restaurant",
    assetTypes: ["QSR", "Drive-through"],
    completionScore: 87,
    focusLines: [
      "Property",
      "General Liability",
      "Workers' Compensation",
      "Commercial Auto",
      "Umbrella / Excess",
      "Business Income",
      "Cyber",
    ],
    summary:
      "QSR operators need scalable property schedules, high-frequency WC controls, and cyber for payment systems across locations.",
    advisoryLead:
      "Franchise agreement insurance exhibits often outpace the local package.",
    advisoryPoints: [
      "Reconcile franchise-required limits against the placed package and umbrella.",
      "Review cyber for POS and delivery-platform integrations.",
      "Confirm drive-through and parking liability treatment on the GL form.",
    ],
    relatedSlugs: ["restaurants-full-service", "retail-storefronts"],
  },
  {
    slug: "bars-lounges-nightclubs",
    name: "Bars, Lounges & Nightclubs",
    industry: "Restaurant",
    assetTypes: ["Bar", "Nightclub"],
    completionScore: 85,
    focusLines: [
      "Property",
      "General Liability",
      "Umbrella / Excess",
      "Workers' Compensation",
      "Commercial Auto",
      "Crime",
    ],
    summary:
      "Alcohol-led venues need liquor liability capacity, assault & battery clarity, and property protection for late-hour occupancy.",
    advisoryLead:
      "Assault & battery sublimits and liquor claims-made quirks are the usual placement failures.",
    advisoryPoints: [
      "Verify assault & battery is not excluded or token-sublimited on the GL form.",
      "Confirm liquor liability limits meet landlord and municipal requirements.",
      "Review security-contractor additional-insured status.",
    ],
    relatedSlugs: ["restaurants-full-service", "catering-operations"],
  },
  {
    slug: "catering-operations",
    name: "Catering Operations",
    industry: "Restaurant",
    assetTypes: ["Caterer", "Commissary"],
    completionScore: 83,
    focusLines: [
      "General Liability",
      "Property",
      "Commercial Auto",
      "Workers' Compensation",
      "Umbrella / Excess",
      "Inland Marine",
    ],
    summary:
      "Caterers combine food liability, auto for event logistics, and inland marine for equipment in transit.",
    advisoryLead:
      "Off-premises catering and third-party venue contracts create additional-insured and liquor gaps.",
    advisoryPoints: [
      "Confirm products / completed operations for off-site service.",
      "Match venue additional-insured and waiver language before events.",
      "Schedule catering equipment on inland marine rather than relying on a thin BPP limit.",
    ],
    relatedSlugs: ["restaurants-full-service", "bars-lounges-nightclubs"],
  },
  {
    slug: "contractors-general",
    name: "General Contractors",
    industry: "Contractors",
    assetTypes: ["GC", "Jobsite", "Yard"],
    completionScore: 93,
    focusLines: [
      "General Liability",
      "Umbrella / Excess",
      "Workers' Compensation",
      "Commercial Auto",
      "Builders Risk",
      "Inland Marine",
      "Property",
    ],
    summary:
      "GCs need occurrence GL with adequate additional-insured capacity, builders risk on active jobs, and inland marine for tools and equipment.",
    advisoryLead:
      "Additional-insured endorsements and residential exclusions are the requirements that most often fail certificate review.",
    advisoryPoints: [
      "Use CG 20 10 / CG 20 37 (or equivalent) forms that match owner contract editions.",
      "Confirm residential and multifamily eligibility if the contractor builds or remodels homes.",
      "Schedule contractors equipment and rented gear on inland marine.",
    ],
    relatedSlugs: [
      "electrical-contractors",
      "plumbing-hvac-contractors",
      "asphalt-paving-contractors",
    ],
  },
  {
    slug: "electrical-contractors",
    name: "Electrical Contractors",
    industry: "Contractors",
    assetTypes: ["Electrical contractor", "Service van fleet"],
    completionScore: 90,
    focusLines: [
      "General Liability",
      "Workers' Compensation",
      "Commercial Auto",
      "Umbrella / Excess",
      "Inland Marine",
      "Property",
    ],
    summary:
      "Electrical contractors need GL for installation exposures, auto for service fleets, and inland marine for tools.",
    advisoryLead:
      "Height work, subcontracted labor, and tool theft drive both frequency and certificate friction.",
    advisoryPoints: [
      "Confirm employee vs independent-contractor treatment for WC and GL.",
      "Schedule high-value testing equipment on inland marine.",
      "Review wrap-up / OCIP interfaces on large commercial projects.",
    ],
    relatedSlugs: ["contractors-general", "plumbing-hvac-contractors"],
  },
  {
    slug: "plumbing-hvac-contractors",
    name: "Plumbing & HVAC Contractors",
    industry: "Contractors",
    assetTypes: ["Plumbing contractor", "HVAC contractor"],
    completionScore: 89,
    focusLines: [
      "General Liability",
      "Workers' Compensation",
      "Commercial Auto",
      "Umbrella / Excess",
      "Inland Marine",
      "Property",
    ],
    summary:
      "Trade contractors need products / completed operations strength and auto / inland marine for mobile service operations.",
    advisoryLead:
      "Water-damage completed-operations claims and rented-equipment gaps are common.",
    advisoryPoints: [
      "Confirm completed-operations aggregate adequacy for multi-year project tails.",
      "Add rented-equipment inland marine where boom lifts and specialty tools are hired.",
      "Align pollution / mold treatment with service contracts.",
    ],
    relatedSlugs: ["contractors-general", "electrical-contractors"],
  },
  {
    slug: "asphalt-paving-contractors",
    name: "Asphalt Paving Contractors",
    industry: "Contractors",
    assetTypes: ["Paving contractor", "Mobile plant"],
    completionScore: 86,
    focusLines: [
      "General Liability",
      "Commercial Auto",
      "Workers' Compensation",
      "Umbrella / Excess",
      "Inland Marine",
      "Property",
    ],
    summary:
      "Paving operations combine heavy auto, mobile equipment, and premises liability at active road and lot sites.",
    advisoryLead:
      "Symbol 1 auto and underinsured mobile equipment are frequent submission gaps.",
    advisoryPoints: [
      "Confirm commercial auto symbols cover hired and non-owned units used on jobs.",
      "Schedule pavers, rollers, and portable plants on inland marine.",
      "Review traffic-control subcontractors for additional-insured flow-down.",
    ],
    relatedSlugs: ["contractors-general", "trucking-local-regional"],
  },
  {
    slug: "trucking-local-regional",
    name: "Local & Regional Trucking",
    industry: "Trucking",
    assetTypes: ["Truck fleet", "Terminal"],
    completionScore: 92,
    focusLines: [
      "Commercial Auto",
      "General Liability",
      "Workers' Compensation",
      "Umbrella / Excess",
      "Property",
      "Inland Marine",
      "Cyber",
    ],
    summary:
      "Truckers need high auto liability and physical damage, motor-truck cargo, and terminal property protection.",
    advisoryLead:
      "Cargo limits and trailer interchange agreements are the requirements that most often fail audit.",
    advisoryPoints: [
      "Match cargo limits to commodity values and bill-of-lading exposure.",
      "Confirm MCS-90 and filing obligations where interstate authority applies.",
      "Review trailer interchange and non-owned trailer physical damage.",
    ],
    relatedSlugs: ["garages-auto-service", "asphalt-paving-contractors"],
  },
  {
    slug: "garages-auto-service",
    name: "Auto Service & Garages",
    industry: "Garages",
    assetTypes: ["Repair shop", "Body shop", "Quick lube"],
    completionScore: 88,
    focusLines: [
      "General Liability",
      "Property",
      "Commercial Auto",
      "Workers' Compensation",
      "Umbrella / Excess",
      "Cyber",
      "Crime",
    ],
    summary:
      "Garages need garagekeepers for customer vehicles, GL for service operations, and cyber for dealer / shop systems.",
    advisoryLead:
      "Garagekeepers limits below peak lot values leave customer vehicles underinsured overnight.",
    advisoryPoints: [
      "Set garagekeepers limits to peak on-lot vehicle values, not average daily counts.",
      "Confirm care, custody, or control exclusions do not gut bailee exposure.",
      "Add cyber for OEM software tools and customer PII.",
    ],
    relatedSlugs: ["trucking-local-regional", "retail-storefronts"],
  },
  {
    slug: "retail-storefronts",
    name: "Retail Storefronts",
    industry: "Retail",
    assetTypes: ["Storefront", "Shop"],
    completionScore: 85,
    focusLines: [
      "Property",
      "General Liability",
      "Workers' Compensation",
      "Commercial Auto",
      "Umbrella / Excess",
      "Crime",
      "Business Income",
      "Cyber",
    ],
    summary:
      "Retailers need property and BI for the location, premises liability, crime for theft, and cyber for payment data.",
    advisoryLead:
      "Business income waiting periods and underinsured contents are the quiet renewal risks.",
    advisoryPoints: [
      "Set BI periods to realistic rebuild and restock timelines for the location.",
      "Reconcile inventory values seasonally for peak merchandise.",
      "Confirm cyber / PCI needs where card data is stored or processed.",
    ],
    relatedSlugs: [
      "grocery-markets",
      "ecommerce-cpg-brands",
      "clothing-apparel-retailers",
    ],
  },
  {
    slug: "grocery-markets",
    name: "Grocery & Specialty Markets",
    industry: "Grocery",
    assetTypes: ["Grocery", "Specialty market"],
    completionScore: 90,
    focusLines: [
      "Property",
      "General Liability",
      "Workers' Compensation",
      "Commercial Auto",
      "Umbrella / Excess",
      "Business Income",
      "Crime",
      "Cyber",
    ],
    summary:
      "Grocers need spoilage, refrigeration breakdown, slip-and-fall liability, and income protection for perishable operations.",
    advisoryLead:
      "Spoilage and equipment breakdown sit outside many basic packages until endorsed.",
    advisoryPoints: [
      "Add equipment breakdown and spoilage with limits tied to cold-storage values.",
      "Review products liability for private-label and prepared foods.",
      "Confirm cyber for loyalty and payment systems.",
    ],
    relatedSlugs: ["retail-storefronts", "restaurants-full-service"],
  },
  {
    slug: "ecommerce-cpg-brands",
    name: "Ecommerce & CPG Brands",
    industry: "Ecommerce",
    assetTypes: ["DTC brand", "3PL inventory"],
    completionScore: 87,
    focusLines: [
      "General Liability",
      "Umbrella / Excess",
      "Cyber",
      "Property",
      "Inland Marine",
      "Workers' Compensation",
      "Crime",
    ],
    summary:
      "DTC and CPG brands need products liability, stock throughput or inland marine for goods in transit, and cyber for storefronts.",
    advisoryLead:
      "Vendor COI requirements and product-recall gaps appear when retail doors open.",
    advisoryPoints: [
      "Confirm products / completed operations aggregates meet retailer vendor guides.",
      "Evaluate product contamination / recall coverage before national distribution.",
      "Cover inventory at 3PLs with stock throughput or location schedules.",
    ],
    relatedSlugs: [
      "clothing-apparel-retailers",
      "beauty-cosmetics-brands",
      "supplement-brands",
    ],
  },
  {
    slug: "clothing-apparel-retailers",
    name: "Clothing & Apparel Retailers",
    industry: "Ecommerce",
    assetTypes: ["Apparel brand", "Boutique"],
    completionScore: 84,
    focusLines: [
      "General Liability",
      "Property",
      "Cyber",
      "Inland Marine",
      "Workers' Compensation",
      "Umbrella / Excess",
      "Crime",
    ],
    summary:
      "Apparel brands need products liability, inventory protection across warehouses, and cyber for DTC storefronts.",
    advisoryLead:
      "Seasonal inventory spikes and influencer / IP claims are easy to under-insure.",
    advisoryPoints: [
      "Adjust inventory and BI values for peak seasons.",
      "Review advertising / IP liability for campaigns and collaborations.",
      "Confirm inland marine for samples and trunk-show goods.",
    ],
    relatedSlugs: ["ecommerce-cpg-brands", "beauty-cosmetics-brands"],
  },
  {
    slug: "beauty-cosmetics-brands",
    name: "Beauty & Cosmetics Brands",
    industry: "Ecommerce",
    assetTypes: ["Beauty brand", "Formulation lab"],
    completionScore: 86,
    focusLines: [
      "General Liability",
      "Umbrella / Excess",
      "Cyber",
      "Property",
      "Workers' Compensation",
      "Inland Marine",
      "Crime",
    ],
    summary:
      "Beauty brands need products liability attentive to skin-care claims, plus recall and cyber as distribution scales.",
    advisoryLead:
      "Ingredient exclusions and recall sublimits are the diligence items retailers ask about first.",
    advisoryPoints: [
      "Read products liability for cosmetic / personal-care exclusions.",
      "Stage product recall / contamination coverage before big-box onboarding.",
      "Protect formulas and customer data with cyber and crime controls.",
    ],
    relatedSlugs: ["ecommerce-cpg-brands", "supplement-brands"],
  },
  {
    slug: "supplement-brands",
    name: "Supplement & Nutraceutical Brands",
    industry: "Ecommerce",
    assetTypes: ["Supplement brand", "Co-packer inventory"],
    completionScore: 88,
    focusLines: [
      "General Liability",
      "Umbrella / Excess",
      "Cyber",
      "Property",
      "Workers' Compensation",
      "Inland Marine",
    ],
    summary:
      "Supplement brands need products liability without harsh ingredient exclusions and stock protection through co-packers.",
    advisoryLead:
      "Ingredient and FDA-related exclusions can hollow out an otherwise adequate products form.",
    advisoryPoints: [
      "Negotiate products wording for dietary-supplement operations.",
      "Cover inventory at co-packers and 3PLs explicitly.",
      "Add cyber for subscription and health-adjacent customer data.",
    ],
    relatedSlugs: ["beauty-cosmetics-brands", "ecommerce-cpg-brands"],
  },
  {
    slug: "alcoholic-beverage-brands",
    name: "Alcoholic Beverage Brands",
    industry: "Ecommerce",
    assetTypes: ["DTC beverage brand", "Tasting room"],
    completionScore: 85,
    focusLines: [
      "General Liability",
      "Umbrella / Excess",
      "Property",
      "Workers' Compensation",
      "Commercial Auto",
      "Cyber",
      "Inland Marine",
    ],
    summary:
      "Wine, spirits, beer, and RTD brands need liquor liability for tasting and events plus products and transit coverage for DTC shipping.",
    advisoryLead:
      "Multi-state shipping and liquor liability triggers vary sharply by channel.",
    advisoryPoints: [
      "Confirm liquor liability for tasting rooms, festivals, and samples.",
      "Review products liability for beverage contamination and labeling.",
      "Cover goods in transit for DTC and wholesale lanes.",
    ],
    relatedSlugs: ["beer-breweries", "restaurants-full-service"],
  },
  {
    slug: "beer-breweries",
    name: "Beer Breweries",
    industry: "Manufacturing",
    assetTypes: ["Brewery", "Taproom"],
    completionScore: 87,
    focusLines: [
      "Property",
      "General Liability",
      "Workers' Compensation",
      "Commercial Auto",
      "Umbrella / Excess",
      "Business Income",
      "Inland Marine",
    ],
    summary:
      "Breweries need equipment breakdown, liquor liability for taprooms, and property values that include tanks and cold storage.",
    advisoryLead:
      "Equipment breakdown and tank / contents valuation gaps show up after mechanical failures.",
    advisoryPoints: [
      "Add equipment breakdown for chillers, boilers, and packaging lines.",
      "Confirm liquor liability for taproom and festival sales.",
      "Schedule specialty equipment and mobile serving units on inland marine.",
    ],
    relatedSlugs: ["alcoholic-beverage-brands", "restaurants-full-service"],
  },
  {
    slug: "pet-business-brands",
    name: "Pet Product Brands",
    industry: "Ecommerce",
    assetTypes: ["Pet brand", "Fulfillment stock"],
    completionScore: 84,
    focusLines: [
      "General Liability",
      "Umbrella / Excess",
      "Cyber",
      "Property",
      "Inland Marine",
      "Workers' Compensation",
    ],
    summary:
      "Pet food and product brands need products liability attentive to animal injury claims and contamination / recall pathways.",
    advisoryLead:
      "Contamination and marketplace vendor requirements often outrun a startup package.",
    advisoryPoints: [
      "Confirm products liability responds to pet injury and food-borne claims.",
      "Evaluate product contamination / recall before scaling marketplace distribution.",
      "Cover inventory across 3PLs and Amazon FBA-style nodes.",
    ],
    relatedSlugs: ["ecommerce-cpg-brands", "animal-rescue-shelter-facilities"],
  },
  {
    slug: "animal-rescue-shelter-facilities",
    name: "Animal Rescue & Shelter Facilities",
    industry: "Healthcare & Social Assistance",
    assetTypes: ["Shelter", "Rescue facility"],
    completionScore: 80,
    focusLines: [
      "General Liability",
      "Property",
      "Workers' Compensation",
      "Commercial Auto",
      "Umbrella / Excess",
      "Crime",
    ],
    summary:
      "Shelters need animal-liability clarity, volunteer injury treatment, and property protection for kennels and medical areas.",
    advisoryLead:
      "Animal bite exclusions and volunteer WC gray areas are the usual coverage surprises.",
    advisoryPoints: [
      "Confirm animal liability is not excluded or severely sublimited.",
      "Document volunteer vs employee status for WC and GL.",
      "Review care, custody, or control for boarded and foster animals.",
    ],
    relatedSlugs: ["pet-business-brands", "veterinary-practices"],
  },
  {
    slug: "veterinary-practices",
    name: "Veterinary Practices",
    industry: "Healthcare & Social Assistance",
    assetTypes: ["Clinic", "Hospital"],
    completionScore: 91,
    focusLines: [
      "Professional Liability",
      "General Liability",
      "Property",
      "Workers' Compensation",
      "Cyber",
      "Umbrella / Excess",
      "Crime",
    ],
    summary:
      "Veterinary practices need animal professional liability, premises liability, and cyber for medical and payment records.",
    advisoryLead:
      "Boarding, mobile practice, and controlled-substance crime exposures are easy to miss on a clinic package.",
    advisoryPoints: [
      "Confirm professional liability includes boarded and hospitalized animals.",
      "Add crime coverage for controlled substances and payment systems.",
      "Review cyber for practice-management software and client data.",
    ],
    relatedSlugs: ["animal-rescue-shelter-facilities", "assisted-living"],
  },
  {
    slug: "bed-breakfast-lodging",
    name: "Bed & Breakfast Lodging",
    industry: "Hospitality",
    assetTypes: ["Inn", "B&B"],
    completionScore: 82,
    focusLines: [
      "Property",
      "General Liability",
      "Umbrella / Excess",
      "Workers' Compensation",
      "Business Income",
      "Cyber",
    ],
    summary:
      "Inns need habitational / hospitality liability, property at RCV, and income protection for seasonal occupancy.",
    advisoryLead:
      "Guest injury and underinsured historic buildings are the primary loss drivers.",
    advisoryPoints: [
      "Confirm the form contemplates transient lodging rather than homeowner occupancy.",
      "Update building values for historic construction and ordinance or law needs.",
      "Add cyber for booking engines and guest payment data.",
    ],
    relatedSlugs: ["short-term-rental-management", "restaurants-full-service"],
  },
  {
    slug: "higher-education-institutions",
    name: "Higher Education Institutions",
    industry: "Education & Childcare",
    assetTypes: ["Campus", "School buildings"],
    completionScore: 95,
    focusLines: [
      "Property",
      "General Liability",
      "Umbrella / Excess",
      "Workers' Compensation",
      "Cyber",
      "Commercial Auto",
      "Crime",
      "Business Income",
    ],
    summary:
      "Campuses need large property schedules, educators legal / liability capacity, athletic and auto exposures, and cyber for student data.",
    advisoryLead:
      "Athletic injury, Title IX-related liability, and cyber for research data require specialty attention beyond a basic package.",
    advisoryPoints: [
      "Map athletic and participant liability separately from general premises liability.",
      "Confirm cyber limits against student and research data inventories.",
      "Review auto for shuttle and maintenance fleets.",
    ],
    relatedSlugs: [
      "education-childcare-centers",
      "architecture-engineering-firms",
    ],
  },
  {
    slug: "education-childcare-centers",
    name: "Education & Childcare Centers",
    industry: "Education & Childcare",
    assetTypes: ["Childcare center", "Private school"],
    completionScore: 93,
    focusLines: [
      "General Liability",
      "Professional Liability",
      "Property",
      "Workers' Compensation",
      "Umbrella / Excess",
      "Commercial Auto",
      "Cyber",
    ],
    summary:
      "Childcare and private schools need abuse & molestation capacity, educators liability, and auto for transport.",
    advisoryLead:
      "Abuse limits and transportation exposures are the certificate items parents and landlords scrutinize.",
    advisoryPoints: [
      "Carry abuse & molestation limits that approach the GL limit with defense outside where available.",
      "Confirm auto coverage for owned and hired vans used for field trips.",
      "Add cyber for student and family records.",
    ],
    relatedSlugs: ["higher-education-institutions", "assisted-living"],
  },
  {
    slug: "industrial-equipment-distributors",
    name: "Industrial Equipment Distributors",
    industry: "Manufacturing",
    assetTypes: ["Distribution warehouse", "Showroom"],
    completionScore: 88,
    focusLines: [
      "Property",
      "General Liability",
      "Commercial Auto",
      "Workers' Compensation",
      "Umbrella / Excess",
      "Inland Marine",
      "Business Income",
    ],
    summary:
      "Distributors need warehouse property, products liability, and inland marine / stock throughput for goods in transit.",
    advisoryLead:
      "Products liability for resold equipment and transit gaps are the claims that surprise finance teams.",
    advisoryPoints: [
      "Confirm vendor / manufacturers liability interfaces for equipment you distribute.",
      "Use stock throughput or cargo for inbound and outbound lanes.",
      "Keep warehouse values aligned with peak inventory.",
    ],
    relatedSlugs: ["metal-fabrication-shops", "trucking-local-regional"],
  },
  {
    slug: "freddie-mac-assisted-living",
    name: "Freddie Mac Assisted Living",
    industry: "Healthcare & Social Assistance",
    assetTypes: ["Assisted living", "Agency senior care"],
    completionScore: 95,
    focusLines: [
      "Property",
      "Business Income",
      "General Liability",
      "Professional Liability",
      "Workers' Compensation",
      "Umbrella / Excess",
      "Builders Risk",
    ],
    summary:
      "Agency-oriented assisted living benchmark used when financing expects a disciplined senior-care coverage floor.",
    advisoryLead:
      "Agency servicing teams look first at professional liability, abuse, and property valuation discipline.",
    advisoryPoints: [
      "Document professional liability and abuse limits against the financing checklist.",
      "Keep business income and extra expense ready for resident relocation.",
      "Maintain current SOV and RCV support for the collateral.",
    ],
    relatedSlugs: ["assisted-living", "fannie-mae-assisted-living"],
  },
  {
    slug: "fannie-mae-assisted-living",
    name: "Fannie Mae Assisted Living",
    industry: "Healthcare & Social Assistance",
    assetTypes: ["Assisted living", "Agency senior care"],
    completionScore: 95,
    focusLines: [
      "Property",
      "Business Income",
      "General Liability",
      "Professional Liability",
      "Workers' Compensation",
      "Umbrella / Excess",
    ],
    summary:
      "Parallel agency senior-care benchmark for deals that reference Fannie Mae insurance expectations.",
    advisoryLead:
      "Servicers focus on evidence quality — ACORD detail, rating, and professional liability continuity.",
    advisoryPoints: [
      "Keep claims-made retro dates continuous across renewals.",
      "Show lender mortgagee / loss-payee wording on evidence.",
      "Reconcile blanket vs scheduled property structures to the guide in force.",
    ],
    relatedSlugs: ["assisted-living", "freddie-mac-assisted-living"],
  },
  {
    slug: "co-op-association",
    name: "Cooperative Corporation",
    industry: "Home Owner's Associations",
    assetTypes: ["Cooperative corporation", "Residential co-op"],
    completionScore: 95,
    focusLines: [
      "Property",
      "General Liability",
      "Umbrella / Excess",
      "Crime",
      "Workers' Compensation",
      "Business Income",
    ],
    summary:
      "Co-op corporations need master property for the building, board / crime protection, and liability for common areas.",
    advisoryLead:
      "Proprietary lease boundaries and aging building systems create assessment risk after partial losses.",
    advisoryPoints: [
      "Clarify corporation vs shareholder insurance duties in the proprietary lease.",
      "Carry ordinance or law adequate for urban rebuild requirements.",
      "Confirm crime coverage for building staff and management access to funds.",
    ],
    relatedSlugs: [
      "condominium-association",
      "homeowners-association-management",
    ],
  },
];
