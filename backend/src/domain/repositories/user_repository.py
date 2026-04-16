"""
Interfaz del repositorio de usuarios del sistema.
"""
from abc import ABC, abstractmethod
from typing import Optional
from ..entities.user import User


class UserRepository(ABC):

    @abstractmethod
    async def get_by_id(self, user_id: int) -> Optional[User]:
        ...

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        ...

    @abstractmethod
    async def get_all(self, active_only: bool = True) -> list[User]:
        ...

    @abstractmethod
    async def create(self, user: User) -> User:
        ...

    @abstractmethod
    async def update(self, user: User) -> User:
        ...
