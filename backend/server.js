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
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4eGx3Z3BqcWdmZmtleGt5cm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5OTk5OTksImV4cCI6MjA1MjU3NTk5OX0.vIvB-rSgZru-VRbx1g0l5A_JwEpTOhU';
const footballApiToken = process.env.FOOTBALL_API_TOKEN || '9747e3521f4e4d82bb417f465c606180';

const supabase = createClient(supabaseUrl, supabaseKey);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Sync matches from football-data.org
app.post('/api/sync/matches', async (req, res) => {
  try {
    const response = await fetch('https://api.football-data.org/v4/competitions/2000/matches', {
      headers: { 'X-Auth-Token': footballApiToken }
    });

    if (!response.ok) {
      throw new Error(`Football API error: ${response.statusText}`);
    }

    const data = await response.json();
    const matches = data.matches;

    // Sync teams
    const teamsMap = new Map();
    matches.forEach(match => {
      if (!teamsMap.has(match.homeTeam.id)) {
        teamsMap.set(match.homeTeam.id, {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          short_name: match.homeTeam.shortName,
          tla: match.homeTeam.tla,
          crest: match.homeTeam.crest,
          group_name: match.group || null
        });
      }
      if (!teamsMap.has(match.awayTeam.id)) {
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

    const teams = Array.from(teamsMap.values());
    const { error: teamsError } = await supabase
      .from('teams')
      .upsert(teams, { onConflict: 'id' });

    if (teamsError) throw teamsError;

    // Sync matches
    const matchesData = matches.map(match => ({
      id: match.id,
      utc_date: match.utcDate,
      status: match.status,
      stage: match.stage,
      group_name: match.group || null,
      home_team_id: match.homeTeam.id,
      away_team_id: match.awayTeam.id,
      home_score: match.score.fullTime.home,
      away_score: match.score.fullTime.away,
      venue: match.venue || null,
      is_locked: new Date(match.utcDate) <= new Date()
    }));

    const { error: matchesError } = await supabase
      .from('matches')
      .upsert(matchesData, { onConflict: 'id' });

    if (matchesError) throw matchesError;

    res.json({
      success: true,
      message: `Synced ${teams.length} teams and ${matchesData.length} matches`,
      data: { teamsCount: teams.length, matchesCount: matchesData.length }
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync matches'
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
    const response = await fetch('https://api.football-data.org/v4/competitions/2000/matches', {
      headers: { 'X-Auth-Token': footballApiToken }
    });

    if (!response.ok) {
      throw new Error(`Football API error: ${response.statusText}`);
    }

    const data = await response.json();
    const matches = data.matches;

    // Sync teams
    const teamsMap = new Map();
    matches.forEach(match => {
      if (!teamsMap.has(match.homeTeam.id)) {
        teamsMap.set(match.homeTeam.id, {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          short_name: match.homeTeam.shortName,
          tla: match.homeTeam.tla,
          crest: match.homeTeam.crest,
          group_name: match.group || null
        });
      }
      if (!teamsMap.has(match.awayTeam.id)) {
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

    const teams = Array.from(teamsMap.values());
    await supabase.from('teams').upsert(teams, { onConflict: 'id' });

    // Sync matches
    const matchesData = matches.map(match => ({
      id: match.id,
      utc_date: match.utcDate,
      status: match.status,
      stage: match.stage,
      group_name: match.group || null,
      home_team_id: match.homeTeam.id,
      away_team_id: match.awayTeam.id,
      home_score: match.score.fullTime.home,
      away_score: match.score.fullTime.away,
      venue: match.venue || null,
      is_locked: new Date(match.utcDate) <= new Date()
    }));

    await supabase.from('matches').upsert(matchesData, { onConflict: 'id' });

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

// Schedule automatic sync every hour
cron.schedule('0 * * * *', async () => {
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