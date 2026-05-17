const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://txxlwgpjqgffkexkyrnj.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_vIvB-rSgZru-VRbx1g0l5A_JwEpTOhU';
const footballApiToken = process.env.FOOTBALL_API_TOKEN || '9747e3521f4e4d82bb417f465c606180';

const supabase = createClient(supabaseUrl, supabaseKey);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Shared football-data.org sync helpers
async function fetchCompetitionMatches() {
  const response = await fetch('https://api.football-data.org/v4/competitions/2000/matches', {
    headers: { 'X-Auth-Token': footballApiToken }
  });

  if (!response.ok) {
    throw new Error(`Football API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.matches || [];
}

function buildTeamsFromMatches(matches) {
  const teamsMap = new Map();

  matches.forEach(match => {
    if (match.homeTeam?.id && !teamsMap.has(match.homeTeam.id)) {
      teamsMap.set(match.homeTeam.id, {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        short_name: match.homeTeam.shortName,
        tla: match.homeTeam.tla,
        crest: match.homeTeam.crest,
        group_name: match.group || null
      });
    }

    if (match.awayTeam?.id && !teamsMap.has(match.awayTeam.id)) {
      teamsMap.set(match.awayTeam.id, {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        short_name: match.awayTeam.shortName,
        tla: match.awayTeam.tla,
        crest: match.awayTeam.crest,
        group_name: match.group || null
      });
    }
  });

  return Array.from(teamsMap.values());
}

function buildMatchesPayload(matches, options = {}) {
  const { includeMatchday = true } = options;

  return matches
    .filter(match => {
      // Filtrar partidos sin equipos definidos (típico en fases eliminatorias futuras)
      if (!match.homeTeam?.id || !match.awayTeam?.id) {
        console.log(`Skipping match ${match.id}: teams not yet defined`);
        return false;
      }
      return true;
    })
    .map(match => {
      const payload = {
        id: match.id,
        utc_date: match.utcDate,
        status: match.status,
        stage: match.stage,
        group_name: match.group || null,
        home_team_id: match.homeTeam.id,
        away_team_id: match.awayTeam.id,
        home_score: match.score?.fullTime?.home ?? null,
        away_score: match.score?.fullTime?.away ?? null,
        venue: match.venue || null,
        is_locked: new Date(match.utcDate) <= new Date()
      };

      if (includeMatchday) {
        payload.matchday = match.matchday || null;
      }

      return payload;
    });
}

async function supportsMatchdayColumn() {
  const { error } = await supabase
    .from('matches')
    .select('matchday')
    .limit(1);

  if (!error) {
    return true;
  }

  if (error.code === 'PGRST204') {
    return false;
  }

  throw error;
}

async function persistMatches(matches) {
  const teams = buildTeamsFromMatches(matches);

  const { error: teamsError } = await supabase
    .from('teams')
    .upsert(teams, { onConflict: 'id' });

  if (teamsError) throw teamsError;

  const includeMatchday = await supportsMatchdayColumn();
  const matchesData = buildMatchesPayload(matches, { includeMatchday });

  const { error: matchesError } = await supabase
    .from('matches')
    .upsert(matchesData, { onConflict: 'id' });

  if (matchesError?.code === 'PGRST204' && includeMatchday) {
    const fallbackMatchesData = buildMatchesPayload(matches, { includeMatchday: false });

    const { error: fallbackError } = await supabase
      .from('matches')
      .upsert(fallbackMatchesData, { onConflict: 'id' });

    if (fallbackError) throw fallbackError;

    return {
      teams,
      matchesData: fallbackMatchesData,
      includeMatchday: false
    };
  }

  if (matchesError) throw matchesError;

  return { teams, matchesData, includeMatchday };
}

// Sync matches from football-data.org
app.post('/api/sync/matches', async (req, res) => {
  try {
    const matches = await fetchCompetitionMatches();
    const { teams, matchesData, includeMatchday } = await persistMatches(matches);

    res.json({
      success: true,
      message: `Synced ${teams.length} teams and ${matchesData.length} matches`,
      data: {
        teamsCount: teams.length,
        matchesCount: matchesData.length,
        matchdayPersisted: includeMatchday
      }
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync matches'
    });
  }
});

// Sync only the 72 World Cup 2026 group-stage matches from a single competition request
app.post('/api/sync/group-stage-matches', async (req, res) => {
  try {
    const matches = await fetchCompetitionMatches();
    const groupStageMatches = matches.filter(match => match.stage === 'GROUP_STAGE');

    if (groupStageMatches.length !== 72) {
      throw new Error(`Expected 72 group-stage matches but received ${groupStageMatches.length}`);
    }

    const { teams, matchesData, includeMatchday } = await persistMatches(groupStageMatches);

    res.json({
      success: true,
      message: `Synced ${matchesData.length} group-stage matches`,
      data: {
        teamsCount: teams.length,
        matchesCount: matchesData.length,
        stage: 'GROUP_STAGE',
        matchdayPersisted: includeMatchday
      }
    });
  } catch (error) {
    console.error('Group stage sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync group-stage matches'
    });
  }
});

// Update match results
app.post('/api/sync/results', async (req, res) => {
  try {
    const response = await fetch('https://api.football-data.org/v4/competitions/2000/matches?status=FINISHED', {
      headers: { 'X-Auth-Token': footballApiToken }
    });

    if (!response.ok) {
      throw new Error(`Football API error: ${response.statusText}`);
    }

    const data = await response.json();
    const matches = data.matches;
    let updatedCount = 0;

    for (const match of matches) {
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          status: match.status,
          home_score: match.score.fullTime.home,
          away_score: match.score.fullTime.away,
          is_locked: true
        })
        .eq('id', match.id);

      if (matchError) {
        console.error(`Error updating match ${match.id}:`, matchError);
        continue;
      }

      if (match.score.fullTime.home !== null && match.score.fullTime.away !== null) {
        const { error: pointsError } = await supabase.rpc('update_predictions_points', {
          match_id_param: match.id
        });

        if (!pointsError) {
          updatedCount++;
        }
      }
    }

    res.json({
      success: true,
      message: `Updated ${updatedCount} matches with results`,
      data: { totalMatches: matches.length, updatedCount }
    });
  } catch (error) {
    console.error('Results sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync results'
    });
  }
});

// Cron job endpoint
app.get('/api/cron/sync-matches', async (req, res) => {
  try {
    const matches = await fetchCompetitionMatches();
    const { teams, matchesData } = await persistMatches(matches);

    // Update points for finished matches
    const finishedMatches = matches.filter(m => m.status === 'FINISHED');
    for (const match of finishedMatches) {
      if (match.score.fullTime.home !== null && match.score.fullTime.away !== null) {
        await supabase.rpc('update_predictions_points', {
          match_id_param: match.id
        });
      }
    }

    // Lock started matches
    await supabase.rpc('lock_started_matches');

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        teamsCount: teams.length,
        matchesCount: matchesData.length,
        finishedCount: finishedMatches.length
      }
    });
  } catch (error) {
    console.error('Cron sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync',
      timestamp: new Date().toISOString()
    });
  }
});

// Schedule automatic sync every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  console.log('Running scheduled sync...');
  try {
    const response = await fetch(`http://localhost:${PORT}/api/cron/sync-matches`);
    const data = await response.json();
    console.log('Scheduled sync completed:', data);
  } catch (error) {
    console.error('Scheduled sync failed:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Made with Bob