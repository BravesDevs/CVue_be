import { getManager, getRepository } from 'typeorm';

/**
 * Get Dashboard Client List
 */
export const getDashboardClientsList: any = async (offset, limit, sortBy, sortType) => {
    const entityManager = getManager();
    return await entityManager.query(`  
    SELECT 
        client_details.id AS id,
        client_details.name AS name,
        IFNULL(agency_used, 0) AS used,
        IFNULL(total_active_workers, 0) AS total_active_workers,
        ROUND(IFNULL(payroll_data.cumulative_savings, 0),
                2) AS cumulative_clearvue_saving,
        ROUND(IFNULL(payroll_data.total_spends, 0), 2) AS total_spend,
        IFNULL(t_and_a_data.active_workers, 0) AS last_week_active_workers
    FROM
        client_details
            LEFT JOIN
        (SELECT 
            client_id,
                COUNT(agency_client_association.id) AS agency_used
        FROM
            agency_client_association
        GROUP BY client_id) agency_client_association_copy ON client_details.id = agency_client_association_copy.client_id
            LEFT JOIN
        (SELECT 
            client_id, COUNT(workers.id) AS total_active_workers
        FROM
            workers
        WHERE
            workers.is_active = 1
        GROUP BY workers.client_id) workers_copy ON client_details.id = workers_copy.client_id
            LEFT JOIN
        agency_client_association ON client_details.id = agency_client_association.client_id
            LEFT JOIN
        workers ON client_details.id = workers.client_id
            LEFT JOIN
        (SELECT 
            client_id,
                SUM(total_pay) AS total_spends,
                SUM(clearvue_savings) AS cumulative_savings
        FROM
            payroll_summary
        GROUP BY payroll_summary.client_id) payroll_data ON client_details.id = payroll_data.client_id
            LEFT JOIN
        (SELECT 
            client_id,
            COUNT(DISTINCT worker_id) AS active_workers
        FROM
            time_and_attendance_data WHERE weekly_hours > 0 AND start_date >= DATE_SUB(DATE(NOW()), INTERVAL DAYOFWEEK(NOW())+6 DAY)
            AND end_date < DATE_SUB(DATE(NOW()), INTERVAL DAYOFWEEK(NOW())-1 DAY)
        GROUP BY time_and_attendance_data.client_id) t_and_a_data ON client_details.id = t_and_a_data.client_id
    GROUP BY client_details.id ORDER BY ${sortBy} ${sortType}, id LIMIT ${offset}, ${limit};
  `);
};


/**
 * Get Dashboard Agency List
 */
export const getDashboardAgencyList: any = async (offset, limit, sortBy, sortType) => {
    const entityManager = getManager();
    return await entityManager.query(`
    SELECT 
        agency_details.id AS id,
        agency_details.name AS name,
        IFNULL(client_used, 0) AS used,
        IFNULL(total_active_workers, 0) AS total_active_workers,
        ROUND(IFNULL(payroll_data.cumulative_savings, 0),
                2) AS cumulative_clearvue_saving,
        ROUND(IFNULL(payroll_data.total_spends, 0), 2) AS total_spend
    FROM
        agency_details
            LEFT JOIN
        (SELECT 
            agency_id,
                COUNT(agency_client_association.id) AS client_used
        FROM
            agency_client_association
        GROUP BY agency_id) agency_client_association_copy ON agency_details.id = agency_client_association_copy.agency_id
            LEFT JOIN
        (SELECT 
            agency_id, COUNT(workers.id) AS total_active_workers
        FROM
            workers WHERE workers.is_active = 1
        GROUP BY workers.agency_id) workers_copy ON agency_details.id = workers_copy.agency_id
            LEFT JOIN
        agency_client_association ON agency_details.id = agency_client_association.agency_id
            LEFT JOIN
        workers ON agency_details.id = workers.agency_id
            LEFT JOIN
        (SELECT 
            agency_id,
                SUM(total_pay) AS total_spends,
                SUM(clearvue_savings) AS cumulative_savings
        FROM
        payroll_summary
        GROUP BY payroll_summary.agency_id) payroll_data ON agency_details.id = payroll_data.agency_id
    GROUP BY agency_details.id ORDER BY ${sortBy} ${sortType}, id LIMIT ${offset}, ${limit};
  `);
};


/**
 * Get Dashboard Sectors List
 */
export const getDashboardSectorsList: any = async (offset, limit, sortBy, sortType) => {
    const entityManager = getManager();
    return await entityManager.query(`
    SELECT
        sector.id AS id,
        sector.value AS name,
        IFNULL(used_by_clients, 0) AS used,
        IFNULL(total_active_workers, 0) AS total_active_workers,
        ROUND(IFNULL(sector_payroll_data.cumulative_savings,
                        0),
                2) AS cumulative_clearvue_saving,
        ROUND(IFNULL(sector_payroll_data.total_spends, 0),
                2) AS total_spend
    FROM
        sector
            LEFT JOIN
        (SELECT
            sector_id, COUNT(client_details.id) AS used_by_clients
        FROM
            client_details
        GROUP BY client_details.sector_id) client_details_copy ON sector.id = client_details_copy.sector_id
            LEFT JOIN
        (SELECT
            sector.id AS sector_id,
                COUNT(workers.id) AS total_active_workers
        FROM
            sector
        LEFT JOIN client_details ON sector.id = client_details.sector_id
        LEFT JOIN workers ON client_details.id = workers.client_id
        WHERE workers.is_active = 1
        GROUP BY sector.id) sector_workers ON sector.id = sector_workers.sector_id
            LEFT JOIN
        (SELECT
            sector.id AS sector_id,
                SUM(total_pay) AS total_spends,
                SUM(clearvue_savings) AS cumulative_savings
        FROM
            sector
        LEFT JOIN client_details ON sector.id = client_details.sector_id
        LEFT JOIN payroll_summary ON client_details.id = payroll_summary.client_id
        GROUP BY sector.id) sector_payroll_data ON sector.id = sector_payroll_data.sector_id
    GROUP BY sector.id ORDER BY ${sortBy} ${sortType}, id LIMIT ${offset}, ${limit};
  `);
};



/**
 * Get Dashboard Analytics Data
 */
export const getDashboardAnalyticsData: any = async () => {
    const entityManager = getManager();
    return await entityManager.query(`
    SELECT 
        (SELECT 
                IFNULL(COUNT(id), 0)
            FROM
                agency_details) AS agency_count,
        (SELECT 
                IFNULL(COUNT(id), 0)
            FROM
                client_details) AS client_count,
        (SELECT 
                IFNULL(COUNT(id), 0)
            FROM
                workers WHERE workers.is_active = 1) AS worker_count,
        (SELECT 
                ROUND(IFNULL(SUM(total_pay), 0), 2)
            FROM
            payroll_summary) AS total_spends,
        (SELECT 
                ROUND(IFNULL(SUM(clearvue_savings), 0), 2)
            FROM
            payroll_summary) AS cumulative_savings;
  `);
};


export const getDashboardCount: any = async (entityName: string) => {
    return await getRepository(entityName).count();
}


export const getDashboardPayrollDataHelper: any = async (offset, limit, sortBy, sortType) => {
    const entityManager = getManager();
    let response: any = {};

    response.all_data = await entityManager.query(`
        select ad.name                    as agency,
        cd.name                    as client,
        count(distinct pr.worker_id) as workers,
        pr.start_date              as start_date,
        pr.week                    as week
        from payroll pr
        inner join client_details cd on pr.client_id = cd.id
        inner join agency_details ad on pr.agency_id = ad.id
        group by pr.agency_id, pr.client_id, pr.start_date;`)

    response.paginated_data = await entityManager.query(`
        select ad.name                    as agency,
        cd.name                    as client,
        count(distinct pr.worker_id) as workers,
        pr.start_date              as start_date,
        pr.week                    as week
        from payroll pr
        inner join client_details cd on pr.client_id = cd.id
        inner join agency_details ad on pr.agency_id = ad.id
        group by pr.agency_id, pr.client_id, pr.start_date ORDER BY ${sortBy} ${sortType}, pr.id ${sortType} LIMIT ${offset}, ${limit}`);

    return response;
}

