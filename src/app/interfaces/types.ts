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

export interface Consulta {
  id?: number;
  paciente_id: number;
  data_consulta: Date | string;
  horario_id: number;
  fisioterapeuta_id: number;
  status?: string;
}
