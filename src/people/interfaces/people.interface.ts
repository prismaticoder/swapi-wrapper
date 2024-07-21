export interface People {
  id: number;
  name: string;
  birth_year: string;
  eye_color: string;
  gender: string;
  hair_color: string;
  height: string;
  mass: string;
  skin_color: string;
  homeworld?: string;
  films?: string[];
  starships?: string[];
  vehicles?: string[];
}
