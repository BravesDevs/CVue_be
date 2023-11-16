import { getRepository } from 'typeorm';
import { Booking } from '../';
import _ from 'lodash';

export const createBookingHelper: any = async (payload) => {
    let bookingRepository = getRepository(Booking);
    let response = await bookingRepository.insert(payload);
    return _.map(response.identifiers, 'id');
}

export const updateBookingStatusHelper: any = async (id, data) => {
    return await getRepository(Booking).update(id, data);
}

export const getBookingById: any = async (id) => {
    return await getRepository(Booking).findOne({
        select: ['id', 'clientId', 'siteId', 'regionId', 'departmentId', 'shiftTypeId', 'requiredHeads', 'status'],
        where: { id: id }
    })
}

export const getbookingDetailsForEmail: any = async (whereClause) => {
    return await getRepository(Booking).createQueryBuilder('booking')
        .innerJoin('booking.bookingAssociations', 'booking_association')
        .innerJoin('booking_association.agency', 'agency_details')
        .leftJoin('agency_details.users', 'user')
        .innerJoin('booking.client', 'client_details')
        .select(['booking.id as booking_id', 'user.email as email', 'agency_details.name as agency_name', 'client_details.name as client_name',
            'booking.start_date as start_date', 'booking.end_date as end_date'])
        .where(whereClause)
        .getRawMany();
}

export const updateBooking: any = async (bookingData) => {
    return await getRepository(Booking).save(bookingData);
}

export const getFulfilmentAndLossCount: any = async (whereClause) => {

    return getRepository(Booking).createQueryBuilder("bk")
    .innerJoin('bk.bookingAssociations', 'ba')
    .select('IFNULL(SUM(`ba`.`requested_total`),0) AS requested_total')
    .addSelect('IFNULL(SUM(`ba`.`fulfilled_total`),0) AS fulfilled_total')
    .where(whereClause)
    .getRawOne();
}
