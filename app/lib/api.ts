import { API_BASE_URL, API_ENDPOINTS } from './api-config';
import { authStorage } from './auth';

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public detail?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = authStorage.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.detail || response.statusText,
      errorData
    );
  }

  return response.json();
}

export const api = {
  auth: {
    register: async (data: {
      vardas: string;
      pavarde: string;
      el_pastas: string;
      tel_numeris: string;
      gimimo_data: string;
      lytis: string;
      slapyvardis: string;
      slaptazodis: string;
      salis: string;
      miestas: string;
      organizatorius?: boolean;
    }) => {
      return fetchApi(API_ENDPOINTS.auth.register, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    login: async (slapyvardis: string, slaptazodis: string) => {
      const response = await fetchApi<{
        access_token: string;
        token_type: string;
        user: any;
      }>(API_ENDPOINTS.auth.login, {
        method: 'POST',
        body: JSON.stringify({ slapyvardis, slaptazodis }),
      });

      authStorage.setToken(response.access_token);
      authStorage.setCurrentUser(response.user);

      return response;
    },

    sendVerificationCode: async (el_pastas: string) => {
      return fetchApi(API_ENDPOINTS.auth.sendVerificationCode, {
        method: 'POST',
        body: JSON.stringify({ el_pastas }),
      });
    },

    verifyCode: async (el_pastas: string, code: string) => {
      return fetchApi(API_ENDPOINTS.auth.verifyCode, {
        method: 'POST',
        body: JSON.stringify({ el_pastas, code }),
      });
    },

    logout: () => {
      authStorage.logout();
    },
  },

  users: {
    getCurrentUser: async () => {
      return fetchApi(API_ENDPOINTS.users.me);
    },

    getUserById: async (id: number) => {
      return fetchApi(API_ENDPOINTS.users.byId(id));
    },

    getUserByUsername: async (username: string) => {
      return fetchApi(API_ENDPOINTS.users.byUsername(username));
    },

    updateAccount: async (data: any) => {
      return fetchApi(API_ENDPOINTS.users.me, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  teams: {
    getAll: async () => {
      return fetchApi(API_ENDPOINTS.teams.list);
    },

    getById: async (id: number) => {
      return fetchApi(API_ENDPOINTS.teams.byId(id));
    },

    create: async (data: {
      pavadinimas: string;
      logotipo_nuoroda?: string;
      aprasymas?: string;
      salis: string;
      miestas: string;
      fk_Klientasid_Klientas: number;
    }) => {
      return fetchApi(API_ENDPOINTS.teams.create, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: any) => {
      return fetchApi(API_ENDPOINTS.teams.update(id), {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return fetchApi(API_ENDPOINTS.teams.delete(id), {
        method: 'DELETE',
      });
    },

    getMembers: async (id: number) => {
      return fetchApi(API_ENDPOINTS.teams.members(id));
    },

    addMember: async (data: {
      fk_Komandaid_Komanda: number;
      fk_Klientasid_Klientas: number;
      role: string;
    }) => {
      return fetchApi(API_ENDPOINTS.teams.addMember, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    removeMember: async (id: number) => {
      return fetchApi(API_ENDPOINTS.teams.removeMember(id), {
        method: 'DELETE',
      });
    },

    offerMembers: async (team_id: number) => {
      return fetchApi(API_ENDPOINTS.teams.offerMembers, {
        method: 'POST',
        body: JSON.stringify({ team_id }),
      });
    },
  },

  tournaments: {
    getAll: async () => {
      return fetchApi(API_ENDPOINTS.tournaments.list);
    },

    getById: async (id: number) => {
      return fetchApi(API_ENDPOINTS.tournaments.byId(id));
    },

    create: async (data: {
      pavadinimas: string;
      aprasas: string;
      sporto_saka: string;
      pradzia: string;
      pabaiga: string;
      minimalus_nariu_skacius: number;
      maksimalus_nariu_skaicius: number;
      turnyro_formatas: string;
      fk_Klientasid_Klientas: number;
    }) => {
      return fetchApi(API_ENDPOINTS.tournaments.create, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: any) => {
      return fetchApi(API_ENDPOINTS.tournaments.update(id), {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return fetchApi(API_ENDPOINTS.tournaments.delete(id), {
        method: 'DELETE',
      });
    },

    getParticipants: async (id: number) => {
      return fetchApi(API_ENDPOINTS.tournaments.participants(id));
    },

    addParticipant: async (data: any) => {
      return fetchApi(API_ENDPOINTS.tournaments.addParticipant, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    removeParticipant: async (id: number) => {
      return fetchApi(API_ENDPOINTS.tournaments.removeParticipant(id), {
        method: 'DELETE',
      });
    },

    getReport: async (id: number) => {
      return fetchApi(API_ENDPOINTS.tournaments.report(id));
    },
  },

  games: {
    getAll: async () => {
      return fetchApi(API_ENDPOINTS.games.list);
    },

    getById: async (id: number) => {
      return fetchApi(API_ENDPOINTS.games.byId(id));
    },

    create: async (data: {
      pavadinimas: string;
      pradžia: string;
      pabaiga: string;
      fk_Turnyrasid_Turnyras: number;
    }) => {
      return fetchApi(API_ENDPOINTS.games.create, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: any) => {
      return fetchApi(API_ENDPOINTS.games.update(id), {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return fetchApi(API_ENDPOINTS.games.delete(id), {
        method: 'DELETE',
      });
    },

    getParticipants: async (id: number) => {
      return fetchApi(API_ENDPOINTS.games.participants(id));
    },

    addParticipant: async (data: any) => {
      return fetchApi(API_ENDPOINTS.games.addParticipant, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    removeParticipant: async (id: number) => {
      return fetchApi(API_ENDPOINTS.games.removeParticipant(id), {
        method: 'DELETE',
      });
    },

    updateParticipant: async (id: number, data: any) => {
      return fetchApi(API_ENDPOINTS.games.updateParticipant(id), {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    addLocation: async (data: any) => {
      return fetchApi(API_ENDPOINTS.games.addLocation, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    linkLocation: async (data: {
      fk_Varzybosid_Varzybos: number;
      fk_Vietaid_Vieta: number;
    }) => {
      return fetchApi(API_ENDPOINTS.games.linkLocation, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    addReferee: async (data: any) => {
      return fetchApi(API_ENDPOINTS.games.addReferee, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    linkReferee: async (data: {
      fk_Varzybosid_Varzybos: number;
      fk_Teisejasid_Teisejas: number;
    }) => {
      return fetchApi(API_ENDPOINTS.games.linkReferee, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getReferees: async (match_id: number) => {
      return fetchApi(API_ENDPOINTS.games.referees(match_id));
    },

    getAllReferees: async () => {
      return fetchApi(API_ENDPOINTS.games.allReferees);
    },

    getAllLocations: async () => {
      return fetchApi(API_ENDPOINTS.games.allLocations);
    },

    getAllSponsors: async () => {
      return fetchApi(API_ENDPOINTS.games.allSponsors);
    },

    createSponsor: async (data: any) => {
      return fetchApi(API_ENDPOINTS.games.createSponsor, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    addMatchSponsor: async (data: any) => {
      return fetchApi(API_ENDPOINTS.games.addMatchSponsor, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getMatchSponsors: async (match_id: number) => {
      return fetchApi(API_ENDPOINTS.games.sponsors(match_id));
    },

    findSimilar: async (match_id: number) => {
      return fetchApi(API_ENDPOINTS.games.findSimilar, {
        method: 'POST',
        body: JSON.stringify({ match_id }),
      });
    },
  },
};

export { ApiError };
