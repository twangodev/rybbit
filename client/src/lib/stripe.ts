const STRIPE_PRICES = [
  // Standard tiers
  {
    price: 19,
    priceId: "price_1RKuxUDFVprnAny2xyyWvXNr",
    name: "standard100k",
    interval: "month",
    limits: {
      events: 100_000,
    },
  },
  {
    price: 190,
    priceId: "price_1RKuxUDFVprnAny2RkoZyxev",
    name: "standard100k-annual",
    interval: "year",
    limits: {
      events: 100_000,
    },
  },
  {
    price: 29,
    priceId: "price_1RKuxTDFVprnAny2TS4Qz0Hi",
    name: "standard250k",
    interval: "month",
    limits: {
      events: 250_000,
    },
  },
  {
    price: 290,
    priceId: "price_1RKuxTDFVprnAny2rDcJOwHn",
    name: "standard250k-annual",
    interval: "year",
    limits: {
      events: 250_000,
    },
  },
  {
    name: "standard500k",
    priceId: "price_1RKuxSDFVprnAny2L7hbJSmO",
    price: 49,
    interval: "month",
    limits: {
      events: 500_000,
    },
  },
  {
    name: "standard500k-annual",
    priceId: "price_1RKuxSDFVprnAny2APD1EsL4",
    price: 490,
    interval: "year",
    limits: {
      events: 500_000,
    },
  },
  {
    name: "standard1m",
    priceId: "price_1RKuxRDFVprnAny2UnTeUnYl",
    price: 69,
    interval: "month",
    limits: {
      events: 1_000_000,
    },
  },
  {
    name: "standard1m-annual",
    priceId: "price_1RKuxRDFVprnAny2f67uFcwC",
    price: 690,
    interval: "year",
    limits: {
      events: 1_000_000,
    },
  },
  {
    name: "standard2m",
    priceId: "price_1RKuxPDFVprnAny2pvdhKxSL",
    price: 99,
    interval: "month",
    limits: {
      events: 2_000_000,
    },
  },
  {
    name: "standard2m-annual",
    priceId: "price_1RKuxPDFVprnAny2NCYgKQf5",
    price: 990,
    interval: "year",
    limits: {
      events: 2_000_000,
    },
  },
  {
    name: "standard5m",
    priceId: "price_1RKuxKDFVprnAny2pytTqnzP",
    price: 149,
    interval: "month",
    limits: {
      events: 5_000_000,
    },
  },
  {
    name: "standard5m-annual",
    priceId: "price_1RKuxKDFVprnAny2UjJFcvHQ",
    price: 1490,
    interval: "year",
    limits: {
      events: 5_000_000,
    },
  },
  {
    name: "standard10m",
    priceId: "price_1RKuxNDFVprnAny2HkZXUcZN",
    price: 249,
    interval: "month",
    limits: {
      events: 10_000_000,
    },
  },
  {
    name: "standard10m-annual",
    priceId: "price_1RKuxNDFVprnAny2mjFH5swO",
    price: 2490,
    interval: "year",
    limits: {
      events: 10_000_000,
    },
  },
  // Pro tiers
  {
    price: 39,
    priceId: "price_1S8szIDFVprnAny2Hg7cxG5b",
    name: "pro100k",
    interval: "month",
    limits: {
      events: 100_000,
    },
  },
  {
    price: 390,
    priceId: "price_1S8szIDFVprnAny2MfwmEsD3",
    name: "pro100k-annual",
    interval: "year",
    limits: {
      events: 100_000,
    },
  },
  {
    price: 59,
    priceId: "price_1S8szHDFVprnAny2VyF3ZOuF",
    name: "pro250k",
    interval: "month",
    limits: {
      events: 250_000,
    },
  },
  {
    price: 590,
    priceId: "price_1S8szHDFVprnAny2KbYorj7v",
    name: "pro250k-annual",
    interval: "year",
    limits: {
      events: 250_000,
    },
  },
  {
    price: 99,
    priceId: "price_1S8szEDFVprnAny2hi4ZSoS8",
    name: "pro500k",
    interval: "month",
    limits: {
      events: 500_000,
    },
  },
  {
    price: 990,
    priceId: "price_1S8szEDFVprnAny2z6M7Befa",
    name: "pro500k-annual",
    interval: "year",
    limits: {
      events: 500_000,
    },
  },
  {
    price: 139,
    priceId: "price_1S8szCDFVprnAny28ccBSIDh",
    name: "pro1m",
    interval: "month",
    limits: {
      events: 1_000_000,
    },
  },
  {
    price: 1390,
    priceId: "price_1S8szCDFVprnAny2ujgml5hL",
    name: "pro1m-annual",
    interval: "year",
    limits: {
      events: 1_000_000,
    },
  },
  {
    price: 199,
    priceId: "price_1S8szBDFVprnAny2h8aeoObg",
    name: "pro2m",
    interval: "month",
    limits: {
      events: 2_000_000,
    },
  },
  {
    price: 1990,
    priceId: "price_1S8szBDFVprnAny2So7DIVTb",
    name: "pro2m-annual",
    interval: "year",
    limits: {
      events: 2_000_000,
    },
  },
  {
    price: 299,
    priceId: "price_1S8sz9DFVprnAny2Mjrl9je6",
    name: "pro5m",
    interval: "month",
    limits: {
      events: 5_000_000,
    },
  },
  {
    price: 2990,
    priceId: "price_1S8sz9DFVprnAny2pEnr5hXD",
    name: "pro5m-annual",
    interval: "year",
    limits: {
      events: 5_000_000,
    },
  },
  {
    price: 499,
    priceId: "price_1S8sz5DFVprnAny2PQR4etWx",
    name: "pro10m",
    interval: "month",
    limits: {
      events: 10_000_000,
    },
  },
  {
    price: 4990,
    priceId: "price_1S8sz5DFVprnAny2drMF3d7U",
    name: "pro10m-annual",
    interval: "year",
    limits: {
      events: 10_000_000,
    },
  },
];

const TEST_TO_PRICE_ID = {
  standard100k: "price_1R1fIVDFVprnAny2yJtRRPBm",
  "standard100k-annual": "price_1R2l2KDFVprnAny2iZr5gFLe",
  standard250k: "price_1R1fKJDFVprnAny2mfiBjkAQ",
  "standard250k-annual": "price_1R2lJIDFVprnAny22zUvjg5o",
  standard500k: "price_1R1fQlDFVprnAny2WwNdiRgT",
  "standard500k-annual": "price_1R2lKIDFVprnAny27wXUAy2D",
  standard1m: "price_1R1fR2DFVprnAny28tPEQAwh",
  "standard1m-annual": "price_1R2lKtDFVprnAny2Xl98rgu4",
  standard2m: "price_1R1fRMDFVprnAny24AMo0Vuu",
  "standard2m-annual": "price_1RE1bQDFVprnAny2ELKQS79d",
  standard5m: "price_1RKuYJDFVprnAny2apEXvkde",
  "standard5m-annual": "price_1RKuYaDFVprnAny2xEoejLRR",
  standard10m: "price_1RKuX5DFVprnAny20UMfh10N",
  "standard10m-annual": "price_1RKuXODFVprnAny2JUjrCSyY",
  pro100k: "price_1S8kgSDFVprnAny2LCbjTkNa",
  "pro100k-annual": "price_1S8kmQDFVprnAny2hZqkMgwT",
  pro250k: "price_1S8kgxDFVprnAny2YSAnQMA6",
  "pro250k-annual": "price_1S8kmHDFVprnAny2cvl0p8OM",
  pro500k: "price_1S8khiDFVprnAny2730Lm8xf",
  "pro500k-annual": "price_1S8km1DFVprnAny28WpKikFH",
  pro1m: "price_1S8ki0DFVprnAny2kwXpmQ7M",
  "pro1m-annual": "price_1S8klqDFVprnAny2mkVUdErk",
  pro2m: "price_1S8kiODFVprnAny217jeiSP3",
  "pro2m-annual": "price_1S8klfDFVprnAny24Yk3Y7HD",
  pro5m: "price_1S8kioDFVprnAny2DV8THSQr",
  "pro5m-annual": "price_1S8klTDFVprnAny2Na9XXAEI",
  pro10m: "price_1S8kkKDFVprnAny2WDjO98bN",
  "pro10m-annual": "price_1S8kl3DFVprnAny2Xdhho4F0",
};

export const getStripePrices = () => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL?.includes("app.rybbit.io")) {
    return STRIPE_PRICES;
  }
  return STRIPE_PRICES.map(price => ({
    ...price,
    priceId: TEST_TO_PRICE_ID[price.name as keyof typeof TEST_TO_PRICE_ID],
  }));
};
