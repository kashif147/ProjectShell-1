export const getLabelToKeyMap = (screenCols) => {
    const mapping = {};

    // Default manual overrides for common mismatches
    const overrides = {
        'Application Status': 'applicationStatus',
        'Membership Status': 'membershipStatus',
        'Membership Category': 'membershipCategory',
        'Work Location': 'workLocation',
        'Department': 'department',
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
