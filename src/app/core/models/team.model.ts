export interface Team {
  id: number;
  name: string;
  short_name: string;
  tla: string;
  crest: string;
  group?: string;
}

export interface Group {
  name: string;
  teams: Team[];
}

// Made with Bob
