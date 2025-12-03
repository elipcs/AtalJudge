export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'Data não definida';
  }

  let date: Date;
  
  date = new Date(dateString);
    
  if (isNaN(date.getTime())) {
    if (dateString.includes('T') && dateString.includes('Z')) {
      date = new Date(dateString);
    }
    else if (dateString.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hour, minute] = timePart.split(':');
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
    }
    else if (dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      date = new Date(dateString.replace(' ', 'T'));
    }
  }

  if (isNaN(date.getTime())) {
    console.warn('❌ [formatDateTime] Data inválida:', dateString);
    return 'Data inválida';
  }
  
  const formattedDate = date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  });
  const formattedTime = date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Sao_Paulo'
  });
  
  return `${formattedDate} às ${formattedTime}`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'Data não definida';
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Data inválida';
  }
  
  return date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  });
}

export function formatDateTimeFull(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'Data não definida';
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Data inválida';
  }
  
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  });
}

export function getCurrentDateFormatted(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Sao_Paulo'
  });
}

export function createBrazilianDate(dateString: string | null | undefined): Date | null {
  if (!dateString) {
    return null;
  }
  
  if (dateString.includes('+') || dateString.includes('-') && dateString.includes(':')) {
    return new Date(dateString);
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date;
}

export function isDatePassed(dateString: string | null | undefined): boolean {
  const date = createBrazilianDate(dateString);
  if (!date) return false;
  
  const now = new Date();
  return now >= date;
}

export function isDateFuture(dateString: string | null | undefined): boolean {
  const date = createBrazilianDate(dateString);
  if (!date) return false;
  
  const now = new Date();
  return now < date;
}

export function toBrazilianDateTimeLocal(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  const date = createBrazilianDate(dateString);
  if (!date) return '';
  
  const localDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
  return localDate.toISOString().slice(0, 16);
}

export function fromBrazilianDateTimeLocal(dateTimeLocal: string): string {
  if (!dateTimeLocal) return '';
  
  const localDate = new Date(dateTimeLocal);
  return localDate.toISOString();
}

export function validateNotPastDate(dateString: string): boolean {
  if (!dateString) return true;
  
  const date = createBrazilianDate(dateString);
  if (!date) return false;
  
  const now = new Date();
  return date >= now;
}

export function validateEndDateAfterStartDate(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return true;
  
  const start = createBrazilianDate(startDate);
  const end = createBrazilianDate(endDate);
  
  if (!start || !end) return false;
  
  return end > start;
}
