import os
import functools

import openai
from pydantic import BaseModel

openai.api_key = os.getenv("OPENAI_API_KEY")


@functools.lru_cache(maxsize=2**16)
def get_completion(prompt, model="gpt-3.5-turbo"):
    messages = [{"role": "user", "content": prompt}]
    response = openai.ChatCompletion.create(
        model=model,
        messages=messages,
        temperature=0,
    )
    return response.choices[0].message["content"]


class EmailRequest(BaseModel):
    user_email: str
    body: str


class MarketplaceRequest(BaseModel):
    user_email: str
    description: str
    marketplace_name: str
    seller_name: str


class JobListingRequest(BaseModel):
    user_email: str
    description: str
    company: str


class Result(BaseModel):
    probability: float
    reasons: list[str]


class ConversationRequest(BaseModel):
    user_email: str
    conversation: str


def process_email_body(email_request: EmailRequest) -> Result:
    prompt = f"""
    The text delimited with triple backticks is the body of an email.
    Determine a probability (percentage from 0 to 100) of this email being a fraud, scam or phishing.
    Provide some brief reasons why (maximum 3).

    Provide the response in a dictionary format like this:
    {{
        "probability": <probability>,
        "reasons": [
            "<reason 1>",
            "<reason 2>",
            "<reason 3>"
        ]
    }}
    ```{email_request.body}```
    """
    completion = get_completion(prompt)
    return Result.parse_raw(completion)


def process_marketplace(marketplace_request: MarketplaceRequest) -> Result:
    prompt = f"""
    The text delimited with triple backticks is the description of a product in {marketplace_request.marketplace_name}.
    The name of the seller is {marketplace_request.seller_name}.
    Determine a probability (percentage from 0 to 100) of this product being a fraud.
    Provide some brief reasons why (maximum 3).

    Provide the response in a dictionary format like this:
    {{
        "probability": <probability>,
        "reasons": [
            "<reason 1>",
            "<reason 2>",
            "<reason 3>"
        ]
    }}
    ```{description}```
    """
    completion = get_completion(prompt)
    return Result.parse_raw(completion)


def process_job_listing(job_listing_request: JobListingRequest) -> Result:
    prompt = f"""
    The text delimited with triple backticks is a job description from the company {job_listing_request.company}.
    Determine a probability (percentage from 0 to 100) of this job listing being a fraud.
    Provide some brief reasons why (maximum 3).

    Watch out for:
    - payment requests
    - spelling mistakes
    - high salary for easy work
    - lack of contact information

    Provide the response in a dictionary format like this:
    {{
        "probability": <probability>,
        "reasons": [
            "<reason 1>",
            "<reason 2>",
            "<reason 3>"
        ]
    }}
    ```{job_listing_request.description}```
    """
    completion = get_completion(prompt)
    return Result.parse_raw(completion)


def process_conversation(conversation_request: ConversationRequest) -> Result:
    prompt = f"""
    The text delimited with triple backticks is a messaging application conversation.
    The conversation is formated as a list as follows

    [
        "[in] <message>",
        "[out] <message>",
        .
        .
        .
    ]

    where "out" represents the outgoing messages from the potential victim, and the responses are labeled "in", for incoming.

    Determine a probability (percentage from 0 to 100) of this conversation being fraud, scam or phishing.
    Provide some brief reasons why (maximum 3).

    Provide the response in a dictionary format like this:
    {{
        "probability": <probability>,
        "reasons": [
            "<reason 1>",
            .
            .
            .
        ]
    }}
    ```{conversation_request.conversation}```
    """
    completion = get_completion(prompt)
    return Result.parse_raw(completion)
