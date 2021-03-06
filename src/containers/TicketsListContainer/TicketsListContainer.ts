import { connect } from 'react-redux'
import {
    TicketsList,
    TicketsListMapProps,
} from '../../components/TicketsList/TicketsList'
import { RootStore } from '../../redux/types'
import { createSelector } from 'reselect'
import { Ticket } from '../../redux/store/tickets/reducer'
import { ticketSelector, sortSelector, stopFiltersSelector } from '../../selectors'

const compareTicketsByPrice = () => (a: Ticket, b: Ticket) => a.price - b.price

const compareTicketsByDuration = () => (a: Ticket, b: Ticket) => {
    const aDuration = a.segments.reduce((acc, segment) => acc + segment.duration, 0)
    const bDuration = b.segments.reduce((acc, segment) => acc + segment.duration, 0)

    return aDuration - bDuration
}

const sortingSelector = createSelector(
    ticketSelector, sortSelector, stopFiltersSelector, (tickets, sort, stopFilters) => {
        let preparedTickets = [...tickets]

        if (Object.entries(stopFilters).length !== 0 && stopFilters.constructor === Object) {
            const stopFiltersKeys = Object.keys(stopFilters)

            preparedTickets = preparedTickets.filter((ticket) => {
                const segmentStops1 = ticket.segments[0].stops.length
                const segmentStops2 = ticket.segments[1].stops.length
                const currentTicketStops = [segmentStops1, segmentStops2]

                if (currentTicketStops.every((ticketStops) => stopFiltersKeys.includes(String(ticketStops)))) return false
                if (currentTicketStops.every((ticketStops) => !stopFiltersKeys.includes(String(ticketStops)))) return true

                for (const stopFilterKey of stopFiltersKeys) {
                    if (Number(stopFilterKey) === segmentStops1) {
                        return segmentStops2 > segmentStops1 ? true : false
                    }
                    if (Number(stopFilterKey) === segmentStops2) {
                        return segmentStops1 > segmentStops2 ? true : false
                    }
                }
            })
        }

        if (sort === 'price') preparedTickets.sort(compareTicketsByPrice())
        if (sort === 'duration') preparedTickets.sort(compareTicketsByDuration())

        return preparedTickets.slice(0, 5)
    },
)

const mapStateToProps = (state: RootStore): TicketsListMapProps => {
    return {
        tickets: sortingSelector(state),
        allTickets: state.tickets,
        isTicketsLoaded: state.isTicketsLoaded,
    }
}

export const TicketsListContainer = connect(
    mapStateToProps,
)(TicketsList)
