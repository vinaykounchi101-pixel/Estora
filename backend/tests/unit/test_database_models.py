"""Unit tests for SQLAlchemy models, constraints, and relationships."""

from datetime import datetime, timezone
from decimal import Decimal
import uuid
import pytest
import sqlalchemy as sa
from sqlalchemy.exc import IntegrityError

from app.models.ml_model import ModelArtifact
from app.models.prediction import Prediction, PredictionType
from app.models.user import User, UserRole


def test_user_creation_defaults(db_session):
    """Verify User model initializes with valid UUID, defaults, and timestamps."""
    user = User(
        email="analyst@estora.com",
        hashed_password="argon2_hashed_secret",
        full_name="Estora Analyst",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert isinstance(user.id, uuid.UUID)
    assert user.email == "analyst@estora.com"
    assert user.role == UserRole.AUTHENTICATED_USER.value
    assert user.is_active is True
    assert user.created_at is not None
    assert user.updated_at is not None


def test_user_unique_email_constraint(db_session):
    """Verify unique constraint on user email raises IntegrityError upon duplicate insertion."""
    user1 = User(email="duplicate@estora.com", hashed_password="hash1")
    user2 = User(email="duplicate@estora.com", hashed_password="hash2")
    db_session.add(user1)
    db_session.commit()

    db_session.add(user2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_prediction_creation_and_attributes(db_session):
    """Verify Prediction model stores fixed-precision price and property snapshot."""
    user = User(email="buyer@estora.com", hashed_password="secure_hash")
    db_session.add(user)
    db_session.commit()

    property_inputs = {
        "area_sqft": 1050,
        "bhk": 2,
        "bathrooms": 2,
        "locality": "Wakad",
        "furnishing_status": "Unfurnished",
        "property_status": "Ready to move",
    }

    prediction = Prediction(
        user_id=user.id,
        prediction_type=PredictionType.SALE_PRICE.value,
        property_inputs=property_inputs,
        estimated_price=Decimal("85.75"),
        currency="INR",
        currency_unit="lakhs",
        model_version="pune_sale_v1",
        supported_geography="Pune, Maharashtra, India",
    )
    db_session.add(prediction)
    db_session.commit()
    db_session.refresh(prediction)

    assert isinstance(prediction.id, uuid.UUID)
    assert prediction.user_id == user.id
    assert prediction.prediction_type == "sale_price"
    assert prediction.estimated_price == Decimal("85.75")
    assert prediction.currency == "INR"
    assert prediction.currency_unit == "lakhs"
    assert prediction.property_inputs["area_sqft"] == 1050
    assert prediction.property_inputs["locality"] == "Wakad"
    assert "decision-support" in prediction.disclaimer.lower()
    assert prediction.created_at is not None



def test_prediction_type_separation():
    """Verify distinct enum values for sale and rental prediction targets."""
    assert PredictionType.SALE_PRICE.value == "sale_price"
    assert PredictionType.MONTHLY_RENT.value == "monthly_rent"
    assert PredictionType.SALE_PRICE != PredictionType.MONTHLY_RENT


def test_visitor_prediction_allows_null_user(db_session):
    """Verify guest/visitor predictions function with null user_id."""
    visitor_prediction = Prediction(
        user_id=None,
        prediction_type=PredictionType.SALE_PRICE.value,
        property_inputs={"area_sqft": 850, "bhk": 2, "locality": "Baner"},
        estimated_price=Decimal("68.20"),
        currency="INR",
        currency_unit="lakhs",
        model_version="pune_sale_v1",
    )
    db_session.add(visitor_prediction)
    db_session.commit()
    db_session.refresh(visitor_prediction)

    assert visitor_prediction.user_id is None
    assert visitor_prediction.user is None
    assert visitor_prediction.estimated_price == Decimal("68.20")


def test_user_deletion_cascades_to_predictions(db_session):
    """Verify deleting a user cascades and removes their owned prediction history."""
    user = User(email="departing@estora.com", hashed_password="hash")
    db_session.add(user)
    db_session.commit()

    prediction = Prediction(
        user_id=user.id,
        prediction_type=PredictionType.SALE_PRICE.value,
        property_inputs={"area_sqft": 1200, "bhk": 3},
        estimated_price=Decimal("110.00"),
        currency="INR",
        currency_unit="lakhs",
        model_version="pune_sale_v1",
    )
    db_session.add(prediction)
    db_session.commit()

    pred_id = prediction.id
    # Delete user
    db_session.delete(user)
    db_session.commit()

    # Query prediction
    remaining_pred = db_session.get(Prediction, pred_id)
    assert remaining_pred is None


def test_model_artifact_metadata_registry(db_session):
    """Verify ModelArtifact metadata persists features, metrics, and active flag without binaries."""
    artifact = ModelArtifact(
        model_name="HistGradientBoosting Pune Sale Regressor",
        model_version="pune_sale_v1",
        prediction_type="sale_price",
        artifact_path="ml/artifacts/sale_price/pune_sale_v1.joblib",
        feature_schema={
            "features": ["area_sqft", "bhk", "bathrooms", "locality"],
            "categorical": ["locality", "furnishing_status"],
        },
        metrics={
            "cv_mae_lakhs": 16.07,
            "holdout_mae_lakhs": 17.35,
            "r2": 0.8066,
        },
        supported_geography="Pune, Maharashtra, India",
        is_active=True,
        trained_at=datetime.now(timezone.utc),
    )
    db_session.add(artifact)
    db_session.commit()
    db_session.refresh(artifact)

    assert artifact.model_version == "pune_sale_v1"
    assert artifact.is_active is True
    assert artifact.metrics["cv_mae_lakhs"] == 16.07
    assert artifact.feature_schema["features"] == ["area_sqft", "bhk", "bathrooms", "locality"]


def test_model_artifact_unique_version(db_session):
    """Verify model_version uniqueness constraint prevents duplicate registrations."""
    a1 = ModelArtifact(
        model_name="Model 1",
        model_version="v1_test",
        prediction_type="sale_price",
        artifact_path="path/1",
        feature_schema={},
        metrics={},
        trained_at=datetime.now(timezone.utc),
    )
    a2 = ModelArtifact(
        model_name="Model 2",
        model_version="v1_test",
        prediction_type="sale_price",
        artifact_path="path/2",
        feature_schema={},
        metrics={},
        trained_at=datetime.now(timezone.utc),
    )
    db_session.add(a1)
    db_session.commit()

    db_session.add(a2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()
