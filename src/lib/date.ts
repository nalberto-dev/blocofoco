// Data local no formato AAAA-MM-DD (o locale sv-SE já devolve nesse formato)
export const todayStr = () => new Date().toLocaleDateString('sv-SE')