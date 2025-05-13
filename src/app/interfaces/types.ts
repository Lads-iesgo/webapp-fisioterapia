export interface TitleProps {
  title: string;
}

export interface HorarioConsulta {
  id: number;
  data: Date | string;
  hora: string;
  status: string;
  paciente: string;
  medico: string;
}
