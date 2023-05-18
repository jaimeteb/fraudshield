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


class Result(BaseModel):
    probability: float
    reasons: list[str]


def process_email_body(email_request: EmailRequest) -> Result:
    prompt = f"""
    The text delimited with triple backticks is the body of an email.
    Determine a probability (percentage from 0 to 100) of this email being a fraud.
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
    email_result = Result.parse_raw(completion)
    return email_result


def process_marketplace(marketplace_request: MarketplaceRequest) -> Result:
    prompt = f"""
    The text delimited with triple backticks is the description of a product in {marketplace_name}.
    The name of the seller is {seller_name}.
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
    marketplace_result = Result.parse_raw(completion)
    return marketplace_result


def process_job_listing(email_request: JobListingRequest) -> Result:
    prompt = f"""
    The text delimited with triple backticks is a job description.
    Determine a probability (percentage from 0 to 100) of this product being a fraud.
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
    ```{email_request.body}```
    """
    completion = get_completion(prompt)
    email_result = Result.parse_raw(completion)
    return email_result
