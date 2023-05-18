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
  BACKGROUND: "fs-ai-result",
  REPORT_FORM: "fs-report-form",
  ANALYZE_FORM: "fs-analyze-form",
  BACKGROUND_ANALYZE: "fs-ai-result-analyze",
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
    messageInSelector: ".message-in .selectable-text",
    messageOutSelector: ".message-out .selectable-text",
  },
  {
    hostname: "www.linkedin.com",
    type: "job-listing",
    companySelector: ".jobs-unified-top-card__company-name",
    bodySelector: "#job-details",
  },
];
