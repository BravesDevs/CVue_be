import { getRepository } from 'typeorm';
import { Booking, BookingAssociation } from '../';

export const createBookingAssociationHelper: any = async (data) => {
    let bookingAssociationRepository = getRepository(BookingAssociation);
    let response = await bookingAssociationRepository.insert(data);

    return response.generatedMaps[0];
};

export const getBookingHelper: any = async (whereClause) => {
    let bookingRepository = getRepository(BookingAssociation);
    let response = await bookingRepository.createQueryBuilder('booking_association')
        .innerJoin('booking_association.booking', 'booking')
        .innerJoin('booking_association.agency', 'agency_details')
        .innerJoin('booking.client', 'client_details')
        .innerJoin('booking.department', 'departments')
        .innerJoin('booking.site', 'site')
        .innerJoin('booking.region', 'region')
        .innerJoin('booking.shiftType', 'shift')
        .select([
            'booking_association.id as id',
            'booking.id as booking_id',
            'booking.client_id as client_id',
            'client_details.name as client_name',
            'booking_association.agency_id as agency_id',
            'agency_details.name as agency_name',
            'booking.site_id as site_id',
            'site.name as site_name',
            'booking.department_id as department_id',
            'departments.name as department_name',
            'booking.shift_type_id as shift_type_id',
            'shift.name as shift_name',
            'booking.region_id as region_id',
            'region.name as region_name',
            "date_format(booking.start_date,'%Y-%m-%d') as start_date",
            "date_format(booking.end_date,'%Y-%m-%d') as end_date",
            'booking.required_heads as required_heads',
            'booking.total as total',
            'booking_association.requested_heads as requested_heads',
            'booking_association.fulfilled_heads as fulfilled_heads',
            'booking_association.requested_total as requested_total',
            'booking_association.fulfilled_total as fulfilled_total'
        ]).where(whereClause)
        .getRawMany()
    return response;
}

export const updateBookingHelper: any = async (id, agency, data) => {
    let associationId = await getRepository(BookingAssociation).findOne({ select: ['id'], where: { agencyId: agency, bookingId: id } });
    let bookingRepository = getRepository(BookingAssociation);
    return await bookingRepository.update(associationId.id, data);
}

export const getBookingAssociationDetails: any = async (whereClause) => {
    return await getRepository(BookingAssociation).findOne({
        select: ['id', 'agencyId', 'requestedHeads', 'requestedTotal', 'bookingId'],
        where: whereClause
    })
}

export const getBookingByClientHelper: any = async (whereClause, page, limit, sortBy, sortType) => {

    let response = await getRepository(BookingAssociation).createQueryBuilder('ba')
        .innerJoin('ba.booking', 'bk')
        .innerJoin('bk.client', 'cdl')
        .innerJoin('bk.region', 'rn')
        .innerJoin('bk.department', 'dep')
        .innerJoin('bk.site', 'st')
        .innerJoin('bk.shiftType', 'sft')
        .select([
            'bk.id AS id',
            'bk.client_id AS client_id',
            'cdl.name as client_name',
            'COUNT(ba.id) AS association_count',
            "date_format(bk.start_date,'%Y-%m-%d') as start_date",
            "date_format(bk.end_date,'%Y-%m-%d') as end_date",
            'bk.department_id as department_id',
            'dep.name as department_name',
            'bk.shift_type_id as shift_type_id',
            'sft.name as shift_name',
            'bk.region_id as region_id',
            'rn.name as region_name',
            'bk.site_id as site_id',
            'st.name as site_name',
            'bk.total as total',
            'bk.status as status'
        ])
        .groupBy('bk.id')
        .orderBy(sortBy, sortType.toUpperCase())
        .addOrderBy('bk.created_at', sortType.toUpperCase())
        .offset((page - 1) * limit)
        .limit(limit)
        .where(whereClause)
        .execute();

    let responseLength = await getRepository(BookingAssociation).createQueryBuilder('ba')
        .innerJoin('ba.booking', 'bk')
        .innerJoin('bk.client', 'cdl')
        .innerJoin('bk.region', 'rn')
        .innerJoin('bk.department', 'dep')
        .innerJoin('bk.site', 'st')
        .innerJoin('bk.shiftType', 'sft')
        .select(['bk.id AS id'])
        .groupBy('bk.id')
        .where(whereClause)
        .execute();
    response["count"] = responseLength.length;

    return response;
}

export const getBookingByAgencyHelper: any = async (whereClause, page, limit, sortBy, sortType) => {

    let response = await getRepository(BookingAssociation).createQueryBuilder('ba')
        .innerJoin('ba.booking', 'bk')
        .innerJoin('bk.client', 'cdl')
        .innerJoin('bk.region', 'rn')
        .innerJoin('bk.department', 'dep')
        .innerJoin('bk.site', 'st')
        .innerJoin('bk.shiftType', 'sft')
        .select([
            'bk.id AS id',
            'bk.client_id AS client_id',
            'cdl.name as client_name',
            'COUNT(ba.id) AS association_count',
            "date_format(bk.start_date,'%Y-%m-%d') as start_date",
            "date_format(bk.end_date,'%Y-%m-%d') as end_date",
            'bk.department_id as department_id',
            'dep.name as department_name',
            'bk.shift_type_id as shift_type_id',
            'sft.name as shift_name',
            'bk.region_id as region_id',
            'rn.name as region_name',
            'bk.site_id as site_id',
            'st.name as site_name',
            'bk.total as total',
            'ba.status as status',
            'ba.requested_total as requested_total',
            'ba.fulfilled_total as fulfilled_total'
        ])
        .groupBy('bk.id')
        .orderBy(sortBy, sortType.toUpperCase())
        .addOrderBy('bk.id', sortType.toUpperCase())
        .offset((page - 1) * limit)
        .limit(limit)
        .where(whereClause)
        .execute();

    let responseLength = await getRepository(BookingAssociation).createQueryBuilder('ba')
        .innerJoin('ba.booking', 'bk')
        .innerJoin('bk.client', 'cdl')
        .innerJoin('bk.region', 'rn')
        .innerJoin('bk.department', 'dep')
        .innerJoin('bk.site', 'st')
        .innerJoin('bk.shiftType', 'sft')
        .select(['bk.id AS id'])
        .groupBy('bk.id')
        .where(whereClause)
        .execute();
    response["count"] = responseLength.length;

    return response;
}

export const updateBookingAssociationDetails = async (data) => {
    return await getRepository(BookingAssociation).save(data);
}