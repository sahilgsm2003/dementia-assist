from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas import schemas
from app.services import auth_service, quiz_service

router = APIRouter(
    prefix="/quiz",
    tags=["quiz"],
    dependencies=[Depends(auth_service.get_current_active_user)],
    responses={404: {"description": "Not found"}},
)


@router.get("/question", response_model=schemas.QuizQuestion)
def get_quiz_question(
    db: Session = Depends(auth_service.get_db),
    current_user: schemas.User = Depends(auth_service.get_current_active_user),
):
    """
    Generate a new quiz question with 4 options.
    Requires that at least 4 family members with photos exist.
    """
    return quiz_service.generate_quiz_question(db=db, user_id=current_user.id, num_options=4)


@router.post("/answer")
def submit_quiz_answer(
    answer: schemas.QuizAnswer,
    db: Session = Depends(auth_service.get_db),
    current_user: schemas.User = Depends(auth_service.get_current_active_user),
):
    """
    Submit an answer to a quiz question and record the result.
    Returns whether the answer was correct and the ID of the correct member.
    """
    return quiz_service.save_quiz_answer(db=db, user_id=current_user.id, answer=answer)
