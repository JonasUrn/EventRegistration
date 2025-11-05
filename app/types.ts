export type User = {
  id: string;
  name: string;
  surname: string;
  email: string;
  phoneNo: string;
  birthDate: string;
  sex: string;
  username: string;
  password: string;
  country: string;
  city: string;
  isOrganizer: boolean;
  isAdministrator: boolean;
  emailWasVerified: boolean;
};

export type TeamMembership = {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  memberSince: string;
};

export type Team = {
  id: string;
  name: string;
  logoLink: string;
  created: string;
  description: string;
  country: string;
  city: string;
  captainId: string;
};

export type Registration = {
  id: string;
  participantType: 'Team' | 'User';
  participantId: string;
  tournamentId: string;
  date: string;
};

export type Tournament = {
  id: string;
  name: string;
  description: string;
  typeOfSport: string;
  start: string;
  end: string;
  minParticipants: number;
  maxParticipants: number;
  format: 'regular' | 'playoffs' | 'finals';
  creatorId: string;
};

export type TournamentParticipant = {
  id: string;
  tournamentId: string;
  participantType: 'Team' | 'User';
  participantId: string;
  position: number;
  points: number;
};

export type Game = {
  id: string;
  tournamentId: string;
  name: string;
  start: string;
  end: string;
  winnerPts: number;
  loserPts: number;
  creatorId: string;
  isAdded: boolean;
};

export type Referee = {
  id: string;
  name: string;
  surname: string;
  email: string;
  phoneNo: string;
  country: string;
  city: string;
  licenseNumber: string;
};

export type Sponsor = {
  id: string;
  name: string;
  email: string;
  class: 'gold' | 'silver' | 'bronze';
  website: string;
};

export type GameParticipant = {
  id: string;
  gameId: string;
  participantId: string;
};

export type GameReferee = {
  gameId: string;
  refereeId: string;
};

export type GameSponsor = {
  gameId: string;
  sponsorId: string;
};
