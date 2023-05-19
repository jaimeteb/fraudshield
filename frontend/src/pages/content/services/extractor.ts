import { MESSAGES, domains, Domain } from "@src/pages/common/constants";

class MarketplaceExtractor {
  meta: Domain;

  constructor(meta: Domain) {
    this.meta = meta;
  }

  private getSellerName() {
    if (this.meta.sellerName) return this.meta.sellerName;
    const node = document.querySelector(this.meta.sellerSelector);
    if (node) return node.textContent;
  }

  extract() {
    const marketplaceName = this.meta.name;
    const sellerName = this.getSellerName();
    const title = document.querySelector(this.meta.titleSelector).textContent;
    const desc = document.querySelector(
      this.meta.descriptionSelector
    ).textContent;

    return {
      description: `${title} ${desc}`
        .replace(/\s+/g, " ")
        .replace('"', "")
        .trim(),
      marketplaceName,
      sellerName,
    };
  }

  process({ description, marketplaceName, sellerName }) {
    chrome?.runtime?.sendMessage({
      type: MESSAGES.CONTENT.MARKETPLACE,
      content: {
        description,
        marketplaceName,
        sellerName,
      },
    });
  }

  init() {
    this.process(this.extract());
  }
}

class EmailExtractor {
  meta: Domain;

  constructor(meta: Domain) {
    this.meta = meta;
  }

  init() {
    chrome?.runtime?.sendMessage({
      type: MESSAGES.CONTENT.EMAIL,
      content: {
        body: document
          .querySelector(this.meta.bodySelector)
          .textContent.replace(/\s+/g, " ")
          .replace('"', "")
          .trim(),
        sender: document
          .querySelector(this.meta.senderSelector)
          .textContent.replace(/\s+/g, " ")
          .replace('"', "")
          .replace('<', "")
          .replace('>', "")
          .trim(),
        subject: document
          .querySelector(this.meta.subjectSelector)
          .textContent.replace(/\s+/g, " ")
          .replace('"', "")
          .trim(),
      },
    });
  }
}

class ConversationExtractor {
  meta: Domain;

  constructor(meta: Domain) {
    this.meta = meta;
  }

  init() {
    let messagesIn = document.querySelectorAll(this.meta.messageInSelector);
    let messagesOut = document.querySelectorAll(this.meta.messageOutSelector);

    const clonedMessagesIn = [];
    const clonedMessagesOut = [];

    messagesIn.forEach((m) => {
      const clonedNode = m.cloneNode(true);
      clonedNode.textContent = `[in] ${m.textContent}`;
      clonedMessagesIn.push(clonedNode);
    });
    messagesOut.forEach((m) => {
      const clonedNode = m.cloneNode(true);
      clonedNode.textContent = `[out] ${m.textContent}`;
      clonedMessagesOut.push(clonedNode);
    });

    let messages = clonedMessagesIn.concat(clonedMessagesOut);

    // sort based on appearance order in the document
    messages.sort(function (a, b) {
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1;
    });

    let contents = messages.map((message) =>
      message.textContent.replace(/\s+/g, " ").replace('"', "").trim()
    );

    chrome?.runtime?.sendMessage({
      type: MESSAGES.CONTENT.CONVERSATION,
      content: {
        messages: contents,
      },
    });
  }
}

class JobListingExtractor {
  meta: Domain;

  constructor(meta: Domain) {
    this.meta = meta;
  }

  init() {
    chrome?.runtime?.sendMessage({
      type: MESSAGES.CONTENT.JOB_LISTING,
      content: {
        company: document
          .querySelector(this.meta.companySelector)
          .textContent.replace(/\s+/g, " ")
          .replace('"', "")
          .trim(),
        description: document
          .querySelector(this.meta.bodySelector)
          .textContent.replace(/\s+/g, " ")
          .replace('"', "")
          .trim(),
      },
    });
  }
}

class ExtractorFactory {
  parseUrl(): string {
    return window.location.hostname;
  }

  get() {
    const hostname = this.parseUrl();
    const websiteInfo = domains.find((d) => d.hostname === hostname);

    if (!websiteInfo) return;

    switch (websiteInfo.type) {
      case "marketplace":
        return new MarketplaceExtractor(websiteInfo);
      case "email":
        return new EmailExtractor(websiteInfo);
      case "conversation":
        return new ConversationExtractor(websiteInfo);
      case "job-listing":
        return new JobListingExtractor(websiteInfo);
      default:
        break;
    }
  }
}

export const extractorFactory = new ExtractorFactory();
