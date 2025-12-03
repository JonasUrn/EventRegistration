from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import Base, engine

from controllers.auth_controller import AuthController
from controllers.email_verification_controller import EmailVerificationController
from controllers.account_controller import AccountController
from controllers.team_controller import TeamController
from controllers.team_edit_controller import TeamEditController
from controllers.tournament_controller import TournamentController
from controllers.matches_controller import MatchesController
from controllers.matches_edit_controller import MatchesEditController
from controllers.search_similar_members_controller import SearchSimilarMembersController
from controllers.find_similar_matches_controller import FindSimilarMatchesController
from controllers.report_controller import ReportController

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Game Portal API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

auth_controller = AuthController()
email_verification_controller = EmailVerificationController()
account_controller = AccountController()
team_controller = TeamController()
team_edit_controller = TeamEditController()
tournament_controller = TournamentController()
matches_controller = MatchesController()
matches_edit_controller = MatchesEditController()
search_similar_members_controller = SearchSimilarMembersController()
find_similar_matches_controller = FindSimilarMatchesController()
report_controller = ReportController()

app.include_router(auth_controller.router)
app.include_router(email_verification_controller.router)
app.include_router(account_controller.router)
app.include_router(team_controller.router)
app.include_router(team_edit_controller.router)
app.include_router(tournament_controller.router)
app.include_router(matches_controller.router)
app.include_router(matches_edit_controller.router)
app.include_router(search_similar_members_controller.router)
app.include_router(find_similar_matches_controller.router)
app.include_router(report_controller.router)

@app.get("/")
def root():
    return {"message": "Game Portal API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
