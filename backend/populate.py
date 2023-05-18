import random
import requests
from faker import Faker
import json


# Set up Faker instance
fake = Faker()

# API endpoint
signup_url = "http://localhost:8000/signup"
reports_url = "http://localhost:8000/reports"

# Number of users to generate
num_users = 10
num_reports = 15


def main():
    users = []
    for _ in range(num_users):
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
        response = requests.post(signup_url, json=user_data)
        print(f"Response: {response.status_code}")
        users.append(user_data["email"])

    for _ in range(num_reports):
        email = random.choice([False, True])
        report_data = {
            "user_email": random.choice(users),
            "fraud_email": fake.email() if email else "",
            "fraud_website": fake.domain_name() if not email else "",
            "details": fake.text(max_nb_chars=50),
        }
        print(f"Sending: {json.dumps(report_data, indent=4)}")
        response = requests.post(reports_url, json=report_data)
        print(f"Response: {response.status_code}")


if __name__ == "__main__":
    main()
