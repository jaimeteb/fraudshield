import requests
from faker import Faker
import json


# Set up Faker instance
fake = Faker()

# API endpoint
url = "http://localhost:8000/signup"

# Number of users to generate
num_users = 10


def main():
    # Generate and send POST requests
    for _ in range(num_users):
        # Generate random user data
        user_data = {
            "email": fake.email(),
            "first_name": fake.first_name(),
            "last_name": fake.last_name(),
            "date_of_birth": fake.date_of_birth().strftime("%Y-%m-%d"),
            "hashed_password": fake.password(
                length=6,
                special_chars=False,
                digits=True,
                upper_case=True,
                lower_case=True,
            ),
        }
        print(f"Sending: {json.dumps(user_data, indent=4)}")

        # Send POST request with JSON payload
        response = requests.post(url, json=user_data)

        # Print response
        print(f"Response: {response.status_code} {response.text}")


if __name__ == "__main__":
    main()
