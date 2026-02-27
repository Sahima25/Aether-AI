import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError

# Secret key for JWT signing. In production, this should be a secure random string from .env
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "aether_super_secret_development_key_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def verify_password(self, plain_password, hashed_password):
        """Verifies if the plain password matches the hashed password."""
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password):
        """Hashes a password using bcrypt."""
        return pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: timedelta | None = None):
        """Generates a JWT token for the user."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def decode_access_token(self, token: str):
        """Decodes and validates a JWT token. Returns the payload or None if invalid."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None
