export const MESSAGES = {
  POPUP: {
    SIGNIN: "fs-signin",
  },
  CONTENT: {
    MARKETPLACE: "fs-marketplace",
    EMAIL: "fs-email",
    CONVERSATION: "fs-conversation",
    JOB_LISTING: "fs-job-listing",
  },
};

export const storageKey = "fs-token";
export const statusKey = "fs-status";

export interface Domain {
  hostname?: string;
  type?: string;
  name?: string;
  titleSelector?: string;
  descriptionSelector?: string;
  sellerName?: string;
  sellerSelector?: string;
  bodySelector?: string;
  messageInSelector?: string;
  messageOutSelector?: string;
  companySelector?: string;
}

export const domains: Domain[] = [
  {
    hostname: "www.alza.hu",
    type: "marketplace",
    name: "alza.hu",
    titleSelector: "h1",
    descriptionSelector: "div.nameextc",
    sellerName: "alza.hu",
    sellerSelector: "",
  },
  {
    hostname: "mail.google.com",
    type: "email",
    bodySelector: ".ii.gt",
  },
  {
    hostname: "web.whatsapp.com",
    type: "conversation",
    messageInSelector: ".message-in",
    messageOutSelector: ".message-out",
  },
  {
    hostname: "www.linkedin.com",
    type: "job-listing",
    companySelector: ".jobs-unified-top-card__company-name",
    bodySelector: "#job-details",
  }
];
