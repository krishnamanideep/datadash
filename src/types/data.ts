export interface PollingStation {
  id: string;
  ac_id: string;
  ac_name: string;
  ps_no: string;
  ps_name: string;
  locality: string;
  latitude: number;
  longitude: number;
  election2011?: ElectionResults;
  election2016?: ElectionResults;
  election2021?: ElectionResults;
}

export interface ElectionResults {
  candidates: {
    [key: string]: number;
  };
  year: number;
}

export interface CandidatePerformance {
  name: string;
  votes_2011: number;
  votes_2016: number;
  votes_2021: number;
  trend: number;
}

export interface RegionalStats {
  year: number;
  totalVotes: number;
  avgTurnout: number;
  winner: string;
  winnerVotes: number;
}

export interface AssemblyHistory {
  year: number;
  candidate_1st: string;
  candidate_2nd: string;
  candidate_3rd: string;
  votes_1st: number;
  votes_2nd: number;
  votes_3rd: number;
}

export interface GIData {
  constituency: string;
  assembly_code: number;
  type_of_seat: string;
  geography: string;
  economy: string;
  general_info: string;
  history: AssemblyHistory[];
}

export interface SurveyData {
  general_survey: {
    high_impact: number;
    low_impact: number;
    no_opinion: number;
  };
  yesno_survey: {
    yes: number;
    no: number;
  };
  gender_samples: {
    F: number;
    M: number;
    T: number;
  };
  gender_response: {
    gender: string;
    high_impact: number;
    low_impact: number;
    no_opinion: number;
  }[];
  caste_age_survey: {
    caste_age: string;
    yes: number;
    high_impact: number;
    low_impact: number;
    no_opinion: number;
  }[];
  caste_age_yesno_survey: {
    caste_age: string;
    yes: number;
    no: number;
  }[];
  mandaram_overview: {
    mandaram: string;
    yes: number;
    high_impact: number;
    low_impact: number;
    no_opinion: number;
  }[];
  mandaram_yesno: {
    mandaram: string;
    yes: number;
    no: number;
  }[];
}

export interface DashboardData {
  pollingStations: PollingStation[];
  candidatePerformance: CandidatePerformance[];
  regionalStats: RegionalStats[];
  giData?: GIData;
  surveyData?: SurveyData;
  summary: {
    totalStations: number;
    constituency: string;
    totalVotes2021: number;
    avgTurnout2021: number;
    winner2021: string;
  };
}
