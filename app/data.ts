import type { User, Team, TeamMembership, Tournament, Game, Registration, TournamentParticipant, Referee, Sponsor, GameParticipant, GameReferee, GameSponsor } from './types';

export let users: User[] = [
  {
    id: '1',
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    phoneNo: '+1234567890',
    birthDate: '1995-05-15',
    sex: 'Male',
    username: 'johndoe',
    password: 'password123',
    country: 'USA',
    city: 'New York',
    isOrganizer: true,
    isAdministrator: false,
    emailWasVerified: true,
  },
  {
    id: '2',
    name: 'Jane',
    surname: 'Smith',
    email: 'jane@example.com',
    phoneNo: '+1234567891',
    birthDate: '1998-08-22',
    sex: 'Female',
    username: 'janesmith',
    password: 'password123',
    country: 'USA',
    city: 'Los Angeles',
    isOrganizer: false,
    isAdministrator: false,
    emailWasVerified: true,
  },
  {
    id: '3',
    name: 'Mike',
    surname: 'Johnson',
    email: 'mike@example.com',
    phoneNo: '+1234567892',
    birthDate: '1992-03-10',
    sex: 'Male',
    username: 'mikej',
    password: 'password123',
    country: 'Canada',
    city: 'Toronto',
    isOrganizer: false,
    isAdministrator: false,
    emailWasVerified: true,
  },
  {
    id: '4',
    name: 'Sarah',
    surname: 'Williams',
    email: 'sarah@example.com',
    phoneNo: '+1234567893',
    birthDate: '1997-11-05',
    sex: 'Female',
    username: 'sarahw',
    password: 'password123',
    country: 'UK',
    city: 'London',
    isOrganizer: true,
    isAdministrator: false,
    emailWasVerified: true,
  },
];

export let teams: Team[] = [
  {
    id: '1',
    name: 'Thunder Strikers',
    logoLink: '/logos/thunder.png',
    created: '2023-01-15',
    description: 'Competitive esports team',
    country: 'USA',
    city: 'New York',
    captainId: '1',
  },
  {
    id: '2',
    name: 'Phoenix Rising',
    logoLink: '/logos/phoenix.png',
    created: '2023-03-20',
    description: 'Professional gaming team',
    country: 'Canada',
    city: 'Toronto',
    captainId: '3',
  },
];

export let teamMemberships: TeamMembership[] = [
  {
    id: '1',
    userId: '1',
    teamId: '1',
    role: 'Captain',
    memberSince: '2023-01-15',
  },
  {
    id: '2',
    userId: '2',
    teamId: '1',
    role: 'Player',
    memberSince: '2023-02-01',
  },
  {
    id: '3',
    userId: '3',
    teamId: '2',
    role: 'Captain',
    memberSince: '2023-03-20',
  },
  {
    id: '4',
    userId: '4',
    teamId: '2',
    role: 'Player',
    memberSince: '2023-04-10',
  },
];

export let tournaments: Tournament[] = [
  {
    id: '1',
    name: 'Summer Championship 2024',
    description: 'Annual summer tournament for all skill levels',
    typeOfSport: 'Esports',
    start: '2024-06-01',
    end: '2024-06-15',
    minParticipants: 4,
    maxParticipants: 16,
    format: 'playoffs',
    creatorId: '1',
  },
  {
    id: '2',
    name: 'Spring Cup',
    description: 'Quick spring tournament',
    typeOfSport: 'Esports',
    start: '2024-04-10',
    end: '2024-04-12',
    minParticipants: 2,
    maxParticipants: 8,
    format: 'regular',
    creatorId: '4',
  },
];

export let games: Game[] = [
  {
    id: '1',
    tournamentId: '1',
    name: 'Semi-Final Match 1',
    start: '2024-06-10T10:00:00',
    end: '2024-06-10T12:00:00',
    winnerPts: 3,
    loserPts: 0,
    creatorId: '1',
  },
  {
    id: '2',
    tournamentId: '1',
    name: 'Semi-Final Match 2',
    start: '2024-06-10T14:00:00',
    end: '2024-06-10T16:00:00',
    winnerPts: 3,
    loserPts: 0,
    creatorId: '1',
  },
  {
    id: '3',
    tournamentId: '2',
    name: 'Opening Match',
    start: '2024-04-10T09:00:00',
    end: '2024-04-10T11:00:00',
    winnerPts: 2,
    loserPts: 1,
    creatorId: '4',
  },
];

export let registrations: Registration[] = [
  {
    id: '1',
    participantType: 'Team',
    participantId: '1',
    tournamentId: '1',
    date: '2024-05-01',
  },
  {
    id: '2',
    participantType: 'Team',
    participantId: '2',
    tournamentId: '1',
    date: '2024-05-02',
  },
  {
    id: '3',
    participantType: 'User',
    participantId: '2',
    tournamentId: '2',
    date: '2024-03-25',
  },
];

export let tournamentParticipants: TournamentParticipant[] = [
  {
    id: '1',
    tournamentId: '1',
    participantType: 'Team',
    participantId: '1',
    position: 1,
    points: 6,
  },
  {
    id: '2',
    tournamentId: '1',
    participantType: 'Team',
    participantId: '2',
    position: 2,
    points: 3,
  },
  {
    id: '3',
    tournamentId: '2',
    participantType: 'User',
    participantId: '2',
    position: 1,
    points: 2,
  },
];

export let referees: Referee[] = [
  {
    id: '1',
    name: 'Robert',
    surname: 'Brown',
    email: 'robert@referee.com',
    phoneNo: '+1234567894',
    country: 'USA',
    city: 'Chicago',
    licenseNumber: 'REF-001',
  },
  {
    id: '2',
    name: 'Emily',
    surname: 'Davis',
    email: 'emily@referee.com',
    phoneNo: '+1234567895',
    country: 'Canada',
    city: 'Montreal',
    licenseNumber: 'REF-002',
  },
];

export let sponsors: Sponsor[] = [
  {
    id: '1',
    name: 'TechCorp',
    email: 'contact@techcorp.com',
    class: 'gold',
    website: 'https://techcorp.com',
  },
  {
    id: '2',
    name: 'GameGear',
    email: 'info@gamegear.com',
    class: 'silver',
    website: 'https://gamegear.com',
  },
];

export let gameParticipants: GameParticipant[] = [
  {
    id: '1',
    gameId: '1',
    participantId: '1',
  },
  {
    id: '2',
    gameId: '1',
    participantId: '2',
  },
  {
    id: '3',
    gameId: '2',
    participantId: '1',
  },
];

export let gameReferees: GameReferee[] = [
  {
    gameId: '1',
    refereeId: '1',
  },
  {
    gameId: '2',
    refereeId: '2',
  },
  {
    gameId: '3',
    refereeId: '1',
  },
];

export let gameSponsors: GameSponsor[] = [
  {
    gameId: '1',
    sponsorId: '1',
  },
  {
    gameId: '2',
    sponsorId: '1',
  },
  {
    gameId: '3',
    sponsorId: '2',
  },
];

export let currentUser: User | null = null;

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};

export const getCurrentUser = () => currentUser;
