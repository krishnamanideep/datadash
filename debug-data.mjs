// Test the actual data generation
import { generateElectionData } from './src/lib/data.ts';

try {
  const data = generateElectionData();
  const firstStation = data.pollingStations[0];
  
  console.log('=== FIRST STATION DATA ===');
  console.log('PS No:', firstStation.ps_no);
  console.log('PS Name:', firstStation.ps_name);
  console.log('Category:', firstStation.category);
  console.log('Strongest Party:', firstStation.strongestParty);
  console.log('Percentage:', firstStation.strongestPartyPercentage);
  
  console.log('\n=== SECOND STATION ===');
  const secondStation = data.pollingStations[1];
  console.log('PS No:', secondStation.ps_no);
  console.log('Category:', secondStation.category);
  console.log('Strongest Party:', secondStation.strongestParty);
  
  console.log('\n=== CHECK: Do values exist? ===');
  console.log('First station has category?', firstStation.category !== undefined);
  console.log('First station has party?', firstStation.strongestParty !== undefined);
  
  console.log('\n=== ALL STATIONS COUNT ===');
  console.log('Total stations:', data.pollingStations.length);
  console.log('Stations with category:', data.pollingStations.filter(s => s.category).length);
  console.log('Stations with party:', data.pollingStations.filter(s => s.strongestParty).length);
} catch (error) {
  console.error('Error:', error);
}
