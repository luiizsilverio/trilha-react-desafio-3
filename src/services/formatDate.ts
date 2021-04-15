import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const formatDate = (strData) => {

  const vdata = new Date(String(strData))

  let dataFormatada = format(vdata, "dd MMM yyyy", { locale: ptBR })

  /*
  let letras = dataFormatada.split('')
  letras[3] = letras[3].toUpperCase()
  dataFormatada = letras.join('')
  */

  return dataFormatada
}
