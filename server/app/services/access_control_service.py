"""
Access control service
"""
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import User, Subscription, Plan, MembershipStatus
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)


class AccessControlService:
    """Check user access to features based on subscription"""

    # Feature-to-plan mapping (by plan name)
    FEATURE_REQUIREMENTS = {
        "REPORT_OVERDUE": ["base", "royal", "groups", "enterprise"],
        "PO_MANAGEMENT": ["royal", "groups", "enterprise"],
        "CREDIT_REPORTS": ["royal", "groups", "enterprise"],
        "AUTO_FOLLOWUPS": ["royal", "groups", "enterprise"],
        "SETTLEMENT": ["royal", "groups", "enterprise"],
        "PARTNER_SHARING": ["groups", "enterprise"],
    }

    @staticmethod
    async def can_access_feature(user_id: str, feature: str, db: AsyncSession) -> bool:
        """
        Check if user can access a feature
        
        Args:
            user_id: User ID
            feature: Feature name
            db: Database session
            
        Returns:
            True if user has access, False if no subscription or expired
        """
        try:
            # Load user once for subscription checks and potential developer bypass
            user_stmt = select(User).where(User.id == user_id)
            user_result = await db.execute(user_stmt)
            user = user_result.scalars().first()

            # Role-based access control: MASTER_ADMIN, OPERATIONS, OPERATION, LEGAL, FINANCIAL bypass all checks
            if user:
                role = user.role
                if hasattr(role, "value"):
                    role = role.value
                role = str(role or "").upper()
                if role in ["MASTER_ADMIN", "OPERATIONS", "OPERATION", "LEGAL", "FINANCIAL", "FINANCE"]:
                    return True
                
                # Check user-level bypass flags first
                if hasattr(user, "subscription_bypass") and user.subscription_bypass:
                    return True
                if hasattr(user, "full_access") and user.full_access:
                    return True

            # Get user's active subscription
            stmt = select(Subscription).where(
                (Subscription.user_id == user_id) &
                (Subscription.is_active == True)
            ).order_by(Subscription.start_date.desc())
            
            result = await db.execute(stmt)
            subscription = result.scalars().first()
            
            if not subscription:
                return False
            
            # Check if subscription is expired. expiry_date can come back
            # timezone-aware or naive depending on how the row was
            # written — comparing it against an unconditionally-naive
            # "now" crashes with "can't compare offset-naive and
            # offset-aware datetimes" whenever it's aware (the same bug
            # already hit twice elsewhere: _scheduled_reminders_runner
            # in main.py, and the Membership page's is_active display in
            # user.py). That crash wasn't a SQLAlchemyError, so it
            # wasn't caught by the except below — it propagated all the
            # way up and made every single feature check fail closed,
            # which is why access looked completely restricted instead
            # of just this one subscription being treated as expired.
            expiry = subscription.expiry_date
            if expiry is not None and expiry.tzinfo is not None:
                expiry = expiry.replace(tzinfo=None)
            if expiry and expiry < datetime.utcnow():
                return False
            
            # For COMPANY_ADMIN or USER, any active (non-expired) subscription grants access
            return True
        except SQLAlchemyError as e:
            logger.error(f"Access check DB error for user={user_id}, feature={feature}: {e}")
            # Fail closed: treat as no access rather than surfacing DB outage to the user
            return False

    @staticmethod
    async def get_user_plan(user_id: str, db: AsyncSession) -> str | None:
        """
        Get user's current plan
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            Plan name or None
        """
        try:
            stmt = select(Subscription).where(
                Subscription.user_id == user_id,
                Subscription.is_active == True
            )
            result = await db.execute(stmt)
            subscription = result.scalars().first()
            return subscription.plan if subscription else None
        except SQLAlchemyError as e:
            logger.error(f"Get user plan DB error for user={user_id}: {e}")
            return None

    @staticmethod
    def get_feature_requirements(feature: str) -> list:
        """
        Get required plans for a feature
        
        Args:
            feature: Feature name
            
        Returns:
            List of plan names that have access
        """
        return AccessControlService.FEATURE_REQUIREMENTS.get(feature, [])
