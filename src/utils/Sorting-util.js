export const sortArray = (array, key, order = 'asc') => {
  if (!Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    const aValue = a[key] || '';
    const bValue = b[key] || '';
    
    const comparison = String(aValue).toLowerCase()
      .localeCompare(String(bValue).toLowerCase());
    
    return order === 'desc' ? -comparison : comparison;
  });
};
