const STRIPE_PRICES = [
  {
    price: 19,
    priceId: "price_1RKuxUDFVprnAny2xyyWvXNr",
    name: "pro100k",
    interval: "month",
    limits: {
      events: 100_000,
    },
  },
  {
    price: 190,
    priceId: "price_1RKuxUDFVprnAny2RkoZyxev",
    name: "pro100k-annual",
    interval: "year",
    limits: {
      events: 100_000,
    },
  },
  {
    price: 29,
    priceId: "price_1RKuxTDFVprnAny2TS4Qz0Hi",
    name: "pro250k",
    interval: "month",
    limits: {
      events: 250_000,
    },
  },
  {
    price: 290,
    priceId: "price_1RKuxTDFVprnAny2rDcJOwHn",
    name: "pro250k-annual",
    interval: "year",
    limits: {
      events: 250_000,
    },
  },
  {
    name: "pro500k",
    priceId: "price_1RKuxSDFVprnAny2L7hbJSmO",
    price: 49,
    interval: "month",
    limits: {
      events: 500_000,
    },
  },
  {
    name: "pro500k-annual",
    priceId: "price_1RKuxSDFVprnAny2APD1EsL4",
    price: 490,
    interval: "year",
    limits: {
      events: 500_000,
    },
  },
  {
    name: "pro1m",
    priceId: "price_1RKuxRDFVprnAny2UnTeUnYl",
    price: 69,
    interval: "month",
    limits: {
      events: 1_000_000,
    },
  },
  {
    name: "pro1m-annual",
    priceId: "price_1RKuxRDFVprnAny2f67uFcwC",
    price: 690,
    interval: "year",
    limits: {
      events: 1_000_000,
    },
  },
  {
    name: "pro2m",
    priceId: "price_1RKuxPDFVprnAny2pvdhKxSL",
    price: 99,
    interval: "month",
    limits: {
      events: 2_000_000,
    },
  },
  {
    name: "pro2m-annual",
    priceId: "price_1RKuxPDFVprnAny2NCYgKQf5",
    price: 990,
    interval: "year",
    limits: {
      events: 2_000_000,
    },
  },
  {
    name: "pro5m",
    priceId: "price_1RKuxKDFVprnAny2pytTqnzP",
    price: 149,
    interval: "month",
    limits: {
      events: 5_000_000,
    },
  },
  {
    name: "pro5m-annual",
    priceId: "price_1RKuxKDFVprnAny2UjJFcvHQ",
    price: 1490,
    interval: "year",
    limits: {
      events: 5_000_000,
    },
  },
  {
    name: "pro10m",
    priceId: "price_1RKuxNDFVprnAny2HkZXUcZN",
    price: 249,
    interval: "month",
    limits: {
      events: 10_000_000,
    },
  },
  {
    name: "pro10m-annual",
    priceId: "price_1RKuxNDFVprnAny2mjFH5swO",
    price: 2490,
    interval: "year",
    limits: {
      events: 10_000_000,
    },
  },
];

const TEST_TO_PRICE_ID = {
  pro100k: "price_1R1fIVDFVprnAny2yJtRRPBm",
  "pro100k-annual": "price_1R2l2KDFVprnAny2iZr5gFLe",
  pro250k: "price_1R1fKJDFVprnAny2mfiBjkAQ",
  "pro250k-annual": "price_1R2lJIDFVprnAny22zUvjg5o",
  pro500k: "price_1R1fQlDFVprnAny2WwNdiRgT",
  "pro500k-annual": "price_1R2lKIDFVprnAny27wXUAy2D",
  pro1m: "price_1R1fR2DFVprnAny28tPEQAwh",
  "pro1m-annual": "price_1R2lKtDFVprnAny2Xl98rgu4",
  pro2m: "price_1R1fRMDFVprnAny24AMo0Vuu",
  "pro2m-annual": "price_1RE1bQDFVprnAny2ELKQS79d",
  pro5m: "price_1RKuYJDFVprnAny2apEXvkde",
  "pro5m-annual": "price_1RKuYaDFVprnAny2xEoejLRR",
  pro10m: "price_1RKuX5DFVprnAny20UMfh10N",
  "pro10m-annual": "price_1RKuXODFVprnAny2JUjrCSyY",
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
