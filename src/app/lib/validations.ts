// ─── Validações de campos de formulário ──────────────────────────────────────────

// Valida CPF (11 dígitos + checksum oficial)
export function isValidCPF(cpf: string): boolean {
  const apenasNumeros = cpf.replace(/\D/g, "");

  if (apenasNumeros.length !== 11) return false;

  // Rejeita CPFs com todos os dígitos iguais (111.111.111-11, etc.)
  if (/^(\d)\1{10}$/.test(apenasNumeros)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(apenasNumeros.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(apenasNumeros.charAt(9))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(apenasNumeros.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(apenasNumeros.charAt(10))) return false;

  return true;
}

// Valida Telefone brasileiro (DDD + 8 ou 9 dígitos)
export function isValidTelefone(telefone: string): boolean {
  const apenasNumeros = telefone.replace(/\D/g, "");

  // Deve ter 10 (fixo) ou 11 (celular) dígitos
  if (apenasNumeros.length !== 10 && apenasNumeros.length !== 11) return false;

  // DDD deve estar entre 11 e 99
  const ddd = parseInt(apenasNumeros.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;

  // Celular (11 dígitos) deve começar com 9 após o DDD
  if (apenasNumeros.length === 11 && apenasNumeros.charAt(2) !== "9") {
    return false;
  }

  return true;
}

// Valida CEP brasileiro (8 dígitos)
export function isValidCEP(cep: string): boolean {
  const apenasNumeros = cep.replace(/\D/g, "");
  if (apenasNumeros.length !== 8) return false;
  // Rejeita CEPs com todos os dígitos iguais
  if (/^(\d)\1{7}$/.test(apenasNumeros)) return false;
  return true;
}

// Valida Data de Nascimento no formato DD/MM/YYYY
export function isValidDataNascimento(data: string): boolean {
  // Aceita também formato ISO YYYY-MM-DD
  let dia: number, mes: number, ano: number;

  if (data.includes("/")) {
    const partes = data.split("/");
    if (partes.length !== 3) return false;
    dia = parseInt(partes[0]);
    mes = parseInt(partes[1]);
    ano = parseInt(partes[2]);
  } else if (data.includes("-")) {
    const partes = data.split("-");
    if (partes.length !== 3) return false;
    ano = parseInt(partes[0]);
    mes = parseInt(partes[1]);
    dia = parseInt(partes[2]);
  } else {
    return false;
  }

  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;

  // Ano razoável (120 anos atrás até hoje)
  const anoAtual = new Date().getFullYear();
  if (ano < anoAtual - 120 || ano > anoAtual) return false;

  // Mês válido
  if (mes < 1 || mes > 12) return false;

  // Dia válido para o mês (considerando anos bissextos)
  const dataObj = new Date(ano, mes - 1, dia);
  if (
    dataObj.getFullYear() !== ano ||
    dataObj.getMonth() !== mes - 1 ||
    dataObj.getDate() !== dia
  ) {
    return false;
  }

  // Não pode ser no futuro
  if (dataObj > new Date()) return false;

  return true;
}

// Capitaliza primeira letra de uma string
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
