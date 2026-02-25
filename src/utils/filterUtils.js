export const getLabelToKeyMap = (screenCols) => {
    const mapping = {};

    // Default manual overrides for common mismatches across screens
    const overrides = {
        'Application Status': 'applicationStatus',
        'Membership Status': 'membershipStatus',
        'Membership Category': 'membershipCategory',
        'Work Location': 'workLocation',
        'Grade': 'grade',
        'Region': 'region',
        'Branch': 'branch',
        'Department': 'department',
        'Gender': 'gender',
        'Email': 'email',
        'Mobile No': 'mobileNumber',
        'Mobile': 'mobileNumber',
        'Forename': 'firstName',
        'Surname': 'lastName',
        'Membership No': 'membershipNumber',
        'Membership Number': 'membershipNumber',
        'Section (Primary)': 'nurseType',
        'Section (Primary Section)': 'nurseType',
        'Category': 'category',
        'Payment Type': 'paymentType',
        'Country of Qualification': 'countryPrimaryQualification',
        'Preferred Address': 'preferredAddress',
        'Personal Email': 'personalEmail',
        'Work Email': 'workEmail',
        'Rank': 'grade', // Sometimes labeled as Rank but mapped to grade
    };

    if (screenCols && Array.isArray(screenCols)) {
        screenCols.forEach(col => {
            const key = Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex;
            if (col.title) mapping[col.title] = key;
        });
    }

    return { ...mapping, ...overrides };
};

export const transformFiltersForApi = (filters, screenCols) => {
    const labelMap = getLabelToKeyMap(screenCols);
    const transformed = {};

    Object.keys(filters).forEach(label => {
        const filter = filters[label];
        if (filter?.selectedValues?.length > 0) {
            const key = labelMap[label] || label.replace(/\s+/g, ''); // fallback to stripped spaces
            transformed[key] = {
                operator: filter.operator === '==' ? 'equal_to' : 'not_equal',
                values: filter.selectedValues
            };
        }
    });
    return transformed;
};

export const transformFiltersFromApi = (apiFilters, screenCols) => {
    const labelMap = getLabelToKeyMap(screenCols);
    // Reverse the map for loading
    const keyToLabel = {};
    Object.keys(labelMap).forEach(label => {
        keyToLabel[labelMap[label]] = label;
    });

    const transformed = {};
    Object.keys(apiFilters || {}).forEach(key => {
        const filter = apiFilters[key];
        const label = keyToLabel[key] || key;
        transformed[label] = {
            operator: filter.operator === 'equal_to' ? '==' : '!=',
            selectedValues: filter.values || filter.selectedValues || []
        };
    });
    return transformed;
};
