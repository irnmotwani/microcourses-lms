from fastapi import Depends, HTTPException, status
from app.utils.auth_jwt import get_current_user

def role_required(*allowed_roles):
    """
    Restrict access to certain roles (e.g., admin, creator)
    Example:
        @router.get("/admin", dependencies=[Depends(role_required("admin"))])
    """
    def role_dependency(current_user=Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Only roles {allowed_roles} are allowed."
            )
        return current_user
    return role_dependency
