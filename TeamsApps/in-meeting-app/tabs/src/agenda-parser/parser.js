import { getMeetingInfo } from "./meetingInfo";

export const getAgendaItems = () => {
    const agendaLineItems = parseAgenda();

    return agendaLineItems.map(agenda => {
        const agendaParts = agenda.split('-');
        return {
            text: agendaParts[0]?.trim(),
            speaker: agendaParts[1]?.trim(),
            timeInMinutes: tryParseInt(agendaParts[2]?.trim()?.replace('m', ''));
        };
    });
}

const parseAgenda = () => {
    const meetingText = getMeetingInfo();
    const agendaTextRaw = getAgendaText(meetingText);
    const agendaLineItems = getAgendaLineItems(agendaTextRaw);

    return agendaLineItems;
}

const getAgendaText = (meetingText) => {
    return meetingText.replace('<<Agenda>>', '').replace('<</Agenda>>', '');
}

const getAgendaLineItems = (agendaRawText) => {
    const agendaLineItemRegex = new RegExp('.*-.*-[0-9]*m', 'ig');
    const agendaLineItemsRaw = agendaRawText.split('\n');
    const validAgendaItems = [];

    agendaLineItemsRaw.forEach(rawAgenda => {
        if (agendaLineItemRegex.test(rawAgenda)) {
            validAgendaItems.push(rawAgenda.trim());
        }
    });

    return validAgendaItems;
}

const tryParseInt = (numberAsString) => {
    const numberValue = parseInt(numberAsString);
    return numberValue === NaN ? 0 : numberValue;
}