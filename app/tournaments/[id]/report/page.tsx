'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../../components/Navigation';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import { authStorage } from '../../../lib/auth';
import { api } from '../../../lib/api';
import layoutStyles from '../../../layout.module.css';

const TournamentReportPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!authStorage.isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const userData = await api.users.getCurrentUser();
        setCurrentUser(userData);

        const tournamentData = await api.tournaments.getById(parseInt(resolvedParams.id));
        setTournament(tournamentData);

        const canManage = tournamentData.fk_Klientasid_Klientas === userData.id_Klientas || userData.administratorius;
        if (!canManage) {
          router.push(`/tournaments/${resolvedParams.id}`);
          return;
        }

        const report = await api.tournaments.getReport(parseInt(resolvedParams.id));
        setReportData(report);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        router.push('/tournaments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, router]);

  if (isLoading || !currentUser || !tournament || !reportData) {
    return null;
  }

  return (
    <div className={layoutStyles.pageContainer}>
      <Navigation />

      <div className={layoutStyles.pageContentNarrow}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className={layoutStyles.pageTitle} style={{ marginBottom: 0 }}>Tournament Report</h1>
          <Button variant="secondary" onClick={() => router.push(`/tournaments/${tournament.id_Turnyras}`)}>
            Back to Tournament
          </Button>
        </div>

        <Card style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            {reportData.tournament.pavadinimas}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sport</p>
              <p style={{ color: 'var(--text-primary)' }}>{reportData.tournament.sporto_saka}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Duration</p>
              <p style={{ color: 'var(--text-primary)' }}>{reportData.tournament.pradzia} - {reportData.tournament.pabaiga}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Matches</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{reportData.total_matches}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Participants</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{reportData.total_participants}</p>
            </div>
          </div>
        </Card>

        <Card style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Top Players
          </h2>
          {reportData.top_players && reportData.top_players.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reportData.top_players.map((player: any, index: number) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: index === 0 ? '2px solid gold' : index === 1 ? '2px solid silver' : index === 2 ? '2px solid #CD7F32' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {index + 1}. {player.vardas} {player.pavarde}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {player.wins} wins, {player.total_points} total points
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                        {player.efficiency}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>efficiency</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No player data available</p>
          )}
        </Card>

        <Card style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Team Statistics
          </h2>
          {reportData.team_stats && Object.keys(reportData.team_stats).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(reportData.team_stats).map(([teamName, stats]: [string, any]) => (
                <div
                  key={teamName}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{teamName}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {stats.wins} / {stats.total_matches} matches won
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                        {stats.win_percentage.toFixed(1)}%
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>win rate</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No team data available</p>
          )}
        </Card>

        <Card style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Venues
          </h2>
          {reportData.locations && reportData.locations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {reportData.locations.map((location: any, index: number) => (
                <div
                  key={index}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <p style={{ color: 'var(--text-primary)' }}>
                    {location.adresas}, {location.miestas}, {location.salis}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No venue data available</p>
          )}
        </Card>

        <Card>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Match Statistics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Average Point Difference
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                {reportData.avg_point_difference.toFixed(1)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TournamentReportPage;
