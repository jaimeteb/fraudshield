export const MESSAGES = {
  POPUP: {
    SIGNIN: "fs-signin",
  },
  CONTENT: {
    MARKETPLACE: "fs-marketplace",
    EMAIL: "fs-email",
    CONVERSATION: "fs-conversation",
  },
  BACKGROUND: "fs-ai-result",
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
];
