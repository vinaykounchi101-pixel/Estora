"""Analytics aggregation service logic."""

from uuid import UUID
from sqlalchemy.orm import Session

from app.repositories.model_repository import ModelRepository
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.analytics import AdminAnalyticsSummary, UserAnalyticsSummary
from app.services.prediction_service import PredictionService


class AnalyticsService:
    """Business logic for aggregate dashboard summaries."""

    @staticmethod
    def get_user_summary(db: Session, user_id: UUID) -> UserAnalyticsSummary:
        """Generate personal analytics summary for an authenticated user."""
        stats = PredictionRepository.get_user_analytics(db, user_id)
        recent_records = PredictionRepository.list_by_user(db, user_id=user_id, skip=0, limit=5)
        recent_mapped = [PredictionService._map_prediction_to_response(r) for r in recent_records]

        return UserAnalyticsSummary(
            total_predictions=stats["total_predictions"],
            sale_predictions=stats["sale_predictions"],
            rent_predictions=stats["rent_predictions"],
            average_sale_estimate_lakhs=stats["average_sale_estimate_lakhs"],
            recent_predictions=recent_mapped,
        )

    @staticmethod
    def get_admin_summary(db: Session) -> AdminAnalyticsSummary:
        """Generate platform-wide analytics for administrators."""
        user_count = UserRepository.count_users(db)
        pred_stats = PredictionRepository.get_global_analytics(db)
        active_models = ModelRepository.count_active(db)

        return AdminAnalyticsSummary(
            total_users=user_count,
            total_predictions=pred_stats["total_predictions"],
            sale_predictions=pred_stats["sale_predictions"],
            rent_predictions=pred_stats["rent_predictions"],
            active_models_count=active_models,
            system_status="operational",
        )
