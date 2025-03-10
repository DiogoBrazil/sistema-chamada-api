export enum ProfileType {
    GENERAL_ADMINISTRATOR = 'GENERAL_ADMINISTRATOR',
    GENERAL_LOCAL_ADMINISTRATOR = 'GENERAL_LOCAL_ADMINISTRATOR',
    LOCAL_ADMINISTRATOR = 'LOCAL_ADMINISTRATOR',
    DOCTOR = 'DOCTOR',
    NURSE = 'NURSE',
    NURSING_TECHNICIAN = 'NURSING_TECHNICIAN',
    ODONTOLOGIST = 'ODONTOLOGIST',
    RECEPTIONIST = 'RECEPTIONIST',
    ACS = 'ACS'
  }
  
  // Perfis que podem realizar administração
  export const ADMIN_PROFILES = [
    ProfileType.GENERAL_ADMINISTRATOR,
    ProfileType.GENERAL_LOCAL_ADMINISTRATOR,
    ProfileType.LOCAL_ADMINISTRATOR
  ];
  
  // Perfis que podem realizar atendimentos 
  export const ATTENDANCE_PROFILES = [
    ProfileType.DOCTOR,
    ProfileType.NURSE,
    ProfileType.NURSING_TECHNICIAN,
    ProfileType.ODONTOLOGIST
  ];
  
  // Perfis que podem gerenciar pacientes e criar atendimentos
  export const PATIENT_MANAGEMENT_PROFILES = [
    ...ADMIN_PROFILES,
    ...ATTENDANCE_PROFILES,
    ProfileType.RECEPTIONIST,
    ProfileType.ACS
  ];
  
  // Mapeamento de perfil para os estágios de atendimento que podem gerenciar
  export const PROFILE_STAGES_MAP = {
    [ProfileType.DOCTOR]: ['MEDICAL_CONSULTATION'],
    [ProfileType.NURSE]: ['TRIAGE', 'NURSING_CONSULTATION', 'VACCINE'],
    [ProfileType.NURSING_TECHNICIAN]: ['TRIAGE', 'VACCINE'],
    [ProfileType.ODONTOLOGIST]: ['DENTAL_CONSULTATION'],
    // Administradores podem acessar todos os estágios em suas devidas jurisdições
    [ProfileType.GENERAL_ADMINISTRATOR]: ['TRIAGE', 'MEDICAL_CONSULTATION', 'NURSING_CONSULTATION', 'DENTAL_CONSULTATION', 'VACCINE'],
    [ProfileType.GENERAL_LOCAL_ADMINISTRATOR]: ['TRIAGE', 'MEDICAL_CONSULTATION', 'NURSING_CONSULTATION', 'DENTAL_CONSULTATION', 'VACCINE'],
    [ProfileType.LOCAL_ADMINISTRATOR]: ['TRIAGE', 'MEDICAL_CONSULTATION', 'NURSING_CONSULTATION', 'DENTAL_CONSULTATION', 'VACCINE']
  };