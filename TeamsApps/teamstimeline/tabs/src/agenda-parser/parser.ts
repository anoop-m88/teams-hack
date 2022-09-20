import { Agenda } from "../models/agenda.types";
import { getMeetingInfo } from "./meetingInfo";

export const getAgendaItems = (): Agenda[] => {
    const agendaLineItems = parseAgenda();

    return agendaLineItems.map(agenda => {
        const agendaParts = agenda.split('-');
        return {
            text: agendaParts[0]?.trim(),
            speaker: agendaParts[1]?.trim(),
            timeInMinutes: tryParseInt(agendaParts[2]?.trim()?.replace('m', ''));
        } as Agenda;
    });
}

const parseAgenda = () => {
    const meetingText = getMeetingInfo();
    const agendaTextRaw = getAgendaText(meetingText);
    const agendaLineItems = getAgendaLineItems(agendaTextRaw);

    return agendaLineItems;
}

const getAgendaText = (meetingText: string) => {
    return meetingText.replace('<<Agenda>>', '').replace('<</Agenda>>', '');
}

const getAgendaLineItems = (agendaRawText: string) => {
    const agendaLineItemRegex = new RegExp('.*-.*-[0-9]*m', 'ig');
    const agendaLineItemsRaw = agendaRawText.split('\n');
    const validAgendaItems: string[] = [];

    agendaLineItemsRaw.forEach(rawAgenda => {
        if (agendaLineItemRegex.test(rawAgenda)) {
            validAgendaItems.push(rawAgenda.trim());
        }
    });

    return validAgendaItems;
}

const tryParseInt = (numberAsString: string) => {
    const numberValue = parseInt(numberAsString);
    return numberValue === NaN ? 0 : numberValue;
}