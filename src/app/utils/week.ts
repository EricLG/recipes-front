export function shiftWeek(week: string, offset: number): string {
    const date = new Date(`${week}T00:00:00Z`)
    date.setUTCDate(date.getUTCDate() + offset * 7)
    return date.toISOString().slice(0, 10)
}

export function currentWeek(now = new Date()): string {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
    const part = (type: string) => parts.find(value => value.type === type)!.value
    const date = new Date(`${part('year')}-${part('month')}-${part('day')}T00:00:00Z`)
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7)
    return date.toISOString().slice(0, 10)
}

export function validWeek(week: string): boolean {
    const date = new Date(`${week}T00:00:00Z`);
    return /^\d{4}-\d{2}-\d{2}$/.test(week) && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === week && date.getUTCDay() === 1 && week <= shiftWeek(currentWeek(), 1);
}

export function weekLabel(week: string): string {
    const start = new Date(`${week}T00:00:00Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    const formatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    return `Du ${formatter.format(start)} au ${formatter.format(end)}`;
}
