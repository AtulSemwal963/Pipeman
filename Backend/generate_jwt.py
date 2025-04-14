from jose import jwt
import hashlib

# Secret key for signing (keep secure in production)
SECRET_KEY = "pipeman-secret-key"
ALGORITHM = "HS256"

# Payload for JWT
payload = {
    "sub": "pipeman_user",
    "role": "clickhouse_user",
    "exp": 1748793600  # Expires 2025-06-30
}

# Generate JWT
token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
print("JWT Token:", token)

# Compute SHA-256 for ClickHouse config
token_hash = hashlib.sha256(token.encode()).hexdigest()
print("SHA-256 Hash:", token_hash)